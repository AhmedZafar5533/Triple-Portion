const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummyKey');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const OrderReport = require('../models/OrderReport');

const { validateOrder } = require('../validation/orderValidation');

/**
 * POST /api/orders/checkout
 * Create a new order and process (mock) payment
 */
exports.createOrder = async (req, res) => {
  try {
    const { error } = validateOrder(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation Error', 
        details: error.details.map(d => d.message) 
      });
    }

    const { items, shippingAddress, totalAmount, totalDeliveryFee, grandTotal, paymentMethod } = req.body;
    const buyerId = req.user.id;

    const enrichedItems = [];
    const vendorsMap = {};

    // 0. Preliminary Stock & Availability Check
    for (const item of items) {
       const product = await Product.findById(item.productId);
       if (!product) {
         return res.status(404).json({ message: `Product ${item.name} no longer exists` });
       }
       if (product.category !== 'Tour' && product.category !== 'Accommodation') {
         if (product.stock < item.quantity) {
           return res.status(400).json({ 
             message: `Insufficient stock for ${item.name}. Only ${product.stock} remaining.`,
             productId: item.productId,
             availableStock: product.stock
           });
         }
       }
        if (product.availabilityStatus !== 'Available' || product.adminDisabled) {
          return res.status(400).json({ message: `Product ${item.name} is currently unavailable` });
        }

        // 0.1 Check date/slot availability
        if (item.category === 'Tour') {
          // Tour: per-date slot validation
          const datesToCheck = item.selectedDates || [];
          const groupSize = item.groupSize || 1;
          const maxGroup = product.maxGroupSize || 1;

          for (const d of datesToCheck) {
            const formatted = new Date(d).toISOString().split('T')[0];
            const slot = (product.dateSlots || []).find(
              s => new Date(s.date).toISOString().split('T')[0] === formatted
            );
            const bookedCount = slot ? slot.bookedCount : 0;
            const available = maxGroup - bookedCount;
            if (groupSize > available) {
              return res.status(400).json({
                message: `Only ${available} slot(s) remaining on ${new Date(d).toLocaleDateString()} for ${item.name}. You requested ${groupSize}.`
              });
            }
          }
        } else if (item.category === 'Accommodation') {
          // Accommodation: simple booked dates check
          const datesToCheck = item.selectedDates || (item.selectedDate ? [item.selectedDate] : []);
          const alreadyBooked = (product.bookedDates || []).map(d => new Date(d).toISOString().split('T')[0]);
          
          for (const d of datesToCheck) {
            const formatted = new Date(d).toISOString().split('T')[0];
            if (alreadyBooked.includes(formatted)) {
              return res.status(400).json({ 
                message: `Sorry, ${new Date(d).toLocaleDateString()} is no longer available for ${item.name}.` 
              });
            }
          }
        }

       const vId = product.vendorId.toString();
       enrichedItems.push({
         ...item,
         vendorId: vId
       });

       if (!vendorsMap[vId]) {
         vendorsMap[vId] = { amount: 0 };
       }
        if (item.category === 'Tour') {
          // Tour: price × groupSize × numberOfDays
          const days = item.selectedDates?.length || 1;
          const groupSize = item.groupSize || 1;
          vendorsMap[vId].amount += (item.priceAtPurchase * groupSize * days) + (item.deliveryCharge || 0);
        } else if (item.category === 'Accommodation') {
          const nights = item.selectedDates?.length || 1;
          vendorsMap[vId].amount += (item.priceAtPurchase * item.quantity * nights) + (item.deliveryCharge || 0);
        } else {
          vendorsMap[vId].amount += (item.priceAtPurchase * item.quantity) + (item.deliveryCharge || 0);
        }
    }

    // 1. Check for existing Unpaid/Failed order to reuse
    let order = await Order.findOne({
      buyerId,
      paymentStatus: { $in: ['Unpaid', 'Failed'] },
      grandTotal: grandTotal,
      // Simple check: same number of items and same grand total
      items: { $size: enrichedItems.length }
    });

    if (order) {
      // Update existing order
      order.items = enrichedItems;
      order.shippingAddress = shippingAddress;
      order.totalAmount = totalAmount;
      order.totalDeliveryFee = totalDeliveryFee;
      order.paymentMethod = paymentMethod;
    } else {
      // Create new Order object
      order = new Order({
        buyerId,
        items: enrichedItems,
        totalAmount,
        totalDeliveryFee,
        grandTotal,
        shippingAddress,
        paymentStatus: 'Unpaid'
      });
    }

    await order.save();

    // IDEMPOTENCY GUARD
    if (order.paymentStatus === 'Paid') {
      return res.status(200).json({
        success: true,
        order,
        payment: { status: 'Success', message: 'Order was already paid' }
      });
    }

    // Prepare line items for Stripe Checkout
    const line_items = enrichedItems.map(item => {
      let itemTotalUGX;
      let stripeQuantity;

      if (item.category === 'Tour') {
        // Tour: price × groupSize × days (groupSize is the "quantity" for Stripe)
        const days = item.selectedDates?.length || 1;
        const groupSize = item.groupSize || 1;
        itemTotalUGX = (item.priceAtPurchase * days) + (item.deliveryCharge || 0);
        stripeQuantity = groupSize;
      } else if (item.category === 'Accommodation') {
        const nights = item.selectedDates?.length || 1;
        itemTotalUGX = (item.priceAtPurchase * nights) + (item.deliveryCharge || 0);
        stripeQuantity = item.quantity;
      } else {
        itemTotalUGX = item.priceAtPurchase + (item.deliveryCharge || 0);
        stripeQuantity = item.quantity;
      }
      
      // Convert UGX to USD (Assuming 1 USD = 3800 UGX)
      // Stripe expects amount in cents
      const unitAmountCentsUSD = Math.round((itemTotalUGX / 3800) * 100);

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name
          },
          unit_amount: unitAmountCentsUSD,
        },
        quantity: stripeQuantity,
      };
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/cancel`,
      client_reference_id: order._id.toString(),
      customer_email: req.user.email,
    });

    res.status(200).json({
      success: true,
      url: session.url
    });

  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Server error during checkout' });
  }
};

const { paginate } = require('../utils/pagination');

/**
 * GET /api/orders/my-orders
 * For Buyers
 */
exports.getBuyerOrders = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { results, total, totalPages } = await paginate(Order, { buyerId: req.user.id }, {
      page,
      limit,
      populate: { path: 'items.productId', select: 'name images' }
    });
    res.json({ orders: results, total, totalPages, currentPage: parseInt(page) || 1 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/orders/vendor
 * For Vendors - only see items belonging to them
 */
exports.getVendorOrders = async (req, res) => {
  try {
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findOne({ userId: req.user.id });
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const { page, limit } = req.query;
    // Find orders that contain items from this vendor and are paid
    const { results, total, totalPages } = await paginate(Order, { 
      'items.vendorId': vendor._id,
      paymentStatus: 'Paid'
    }, {
      page,
      limit,
      populate: [
        { path: 'buyerId', select: 'name email phone' },
        { path: 'items.productId' }
      ]
    });

    // Filter the items within those orders to only show the vendor's items
    const filteredOrders = results.map(order => {
      const myItems = order.items.filter(item => item.vendorId.toString() === vendor._id.toString());
      return {
        ...order,
        items: myItems,
        isPaid: order.paymentStatus === 'Paid'
      };
    });

    res.json({ orders: filteredOrders, total, totalPages, currentPage: parseInt(page) || 1 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/orders/admin
 * For Admins - see all orders and payment details
 */
exports.getAdminOrders = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      // Check if search is a valid ObjectId if it looks like one, otherwise regex
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(search)) {
        query._id = search;
      } else {
        // Fallback or search in populated fields? Paginate doesn't easily search populated.
        // For now just ID if valid or ignore if not.
      }
    }

    const { results, total, totalPages } = await paginate(Order, query, {
      page,
      limit,
      populate: [
        { path: 'buyerId', select: 'username email' },
        { path: 'paymentId' }
      ]
    });
    res.json({ orders: results, total, totalPages, currentPage: parseInt(page) || 1 });
  } catch (err) {
    console.error('getAdminOrders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PATCH /api/orders/:orderId/item-status
 * For Vendors to update status of their items
 */
exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, status, cancelReason } = req.body;
    
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const vendorId = vendor._id;

    const order = await Order.findOne({ _id: orderId, 'items.vendorId': vendorId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.paymentStatus !== 'Paid') {
      return res.status(403).json({ message: 'Cannot update status of an unpaid order' });
    }

    // Update the specific item's status
    let allCompleted = true;
    order.items.forEach(item => {
      // Robust comparison using .equals() for ObjectIds or .toString() for strings
      const itemVendorId = item.vendorId.toString();
      const itemProductId = item.productId.toString();

      if (itemVendorId === vendorId.toString() && itemProductId === productId.toString()) {
        item.status = status;
        if (status === 'Cancelled' && cancelReason) {
          item.cancelReason = cancelReason;
        }
      }
      
      // Check if all items are in a final "completed" state
      const completedStates = ['Delivered', 'Completed', 'Checked-out'];
      if (!completedStates.includes(item.status)) {
        allCompleted = false;
      }
    });

    // If all items in the order are finished, mark order as completed
    if (allCompleted) order.status = 'Completed';

    await order.save();
    res.json({ message: 'Status updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/orders/:orderId/report
 * Submit a report for an order
 */
exports.reportOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, description } = req.body;
    const buyerId = req.user.id;

    // Check if order exists and belongs to buyer
    const order = await Order.findOne({ _id: orderId, buyerId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ message: 'Cannot report an unpaid order' });
    }

    const report = new OrderReport({
      orderId,
      buyerId,
      reason,
      description
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Server error while submitting report' });
  }
};
