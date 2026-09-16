const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummyKey');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Vendor = require('../models/Vendor');
const VendorLedger = require('../models/VendorLedger');

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Determine secret key from env or use a hardcoded one for testing if not provided
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // The order ID was passed in client_reference_id
    const orderId = session.client_reference_id;
    
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        console.error(`[Webhook] Order ${orderId} not found`);
        return res.status(404).send('Order not found');
      }

      // Idempotency check: if already paid, skip processing
      if (order.paymentStatus === 'Paid') {
        return res.status(200).send('Already processed');
      }

      // Group vendors to calculate amounts (needed for Payment record and Ledger)
      const vendorsMap = {};
      const enrichedItems = order.items;
      for (const item of enrichedItems) {
        const vId = item.vendorId.toString();
        if (!vendorsMap[vId]) {
          vendorsMap[vId] = { amount: 0 };
        }
        if (item.category === 'Tour') {
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

      const vendorsList = await Promise.all(Object.keys(vendorsMap).map(async (vId) => {
        const vendorDoc = await Vendor.findById(vId).populate('businessContact.businessEmail');
        let vendorEmail = vendorDoc?.businessContact?.businessEmail;
        if (!vendorEmail && vendorDoc) {
          const populatedVendor = await Vendor.findById(vId).populate('userId', 'email');
          vendorEmail = populatedVendor?.userId?.email;
        }

        return {
          vendorId: vId,
          vendorEmail: vendorEmail || 'vendor@example.com',
          amount: vendorsMap[vId].amount
        };
      }));

      // Create Payment Record
      const payment = new Payment({
        orderId: order._id,
        buyerId: order.buyerId,
        buyerEmail: session.customer_details?.email || 'buyer@example.com',
        vendors: vendorsList,
        amount: order.grandTotal,
        status: 'Success',
        transactionId: session.payment_intent || session.id,
        paymentMethod: 'Stripe',
        paymentDetails: {
          gatewayResponse: {
            sessionId: session.id,
            payment_status: session.payment_status
          }
        }
      });

      await payment.save();

      // Update Order Status
      order.paymentId = payment._id;
      order.paymentStatus = 'Paid';
      await order.save();

      // Update Product Stock, Booked Dates/Slots, and Vendor Earnings
      for (const item of enrichedItems) {
        if (item.category === 'Tour') {
          // Tour: increment dateSlots bookedCount for each selected date
          const groupSize = item.groupSize || 1;
          if (item.selectedDates?.length > 0) {
            const product = await Product.findById(item.productId);
            if (product) {
              for (const d of item.selectedDates) {
                const dateStr = new Date(d).toISOString().split('T')[0];
                const existingSlot = product.dateSlots.find(
                  s => new Date(s.date).toISOString().split('T')[0] === dateStr
                );
                if (existingSlot) {
                  existingSlot.bookedCount += groupSize;
                } else {
                  product.dateSlots.push({ date: new Date(d), bookedCount: groupSize });
                }
              }

              // Check if any available dates still have open slots
              const maxGroup = product.maxGroupSize || 1;
              const slotMap = {};
              product.dateSlots.forEach(s => {
                const key = new Date(s.date).toISOString().split('T')[0];
                slotMap[key] = s.bookedCount || 0;
              });
              
              const hasAvailableDates = (product.availableDates || []).some(d => {
                const dateStr = new Date(d).toISOString().split('T')[0];
                const booked = slotMap[dateStr] || 0;
                return booked < maxGroup;
              });

              if (!hasAvailableDates) {
                product.availabilityStatus = 'Unavailable';
              }

              await product.save();
            }
          }
        } else if (item.category === 'Accommodation') {
          // Accommodation: mark dates as booked
          const datesToBook = item.selectedDates?.length
            ? item.selectedDates.map(d => new Date(d))
            : item.selectedDate ? [new Date(item.selectedDate)] : [];

          if (datesToBook.length > 0) {
            const product = await Product.findById(item.productId);
            if (product) {
              // Add to bookedDates
              datesToBook.forEach(d => {
                const exists = product.bookedDates.some(bd => bd.getTime() === d.getTime());
                if (!exists) product.bookedDates.push(d);
              });
              
              // Check if all available dates are booked
              const normalizedBooked = (product.bookedDates || []).map(bd => bd.toISOString().split('T')[0]);
              const hasAvailableDates = (product.availableDates || []).some(d => {
                const dateStr = new Date(d).toISOString().split('T')[0];
                return !normalizedBooked.includes(dateStr);
              });

              if (!hasAvailableDates) {
                product.availabilityStatus = 'Unavailable';
              }
              await product.save();
            }
          }
        } else {
          // Physical product: decrement stock
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock = Math.max(0, product.stock - item.quantity);
            if (product.stock === 0) {
              product.availabilityStatus = 'Unavailable';
            }
            await product.save();
          }
        }
      }

      // 4b. Update vendor earnings and create ledger entries
      for (const [vendorDocId, data] of Object.entries(vendorsMap)) {
        // Atomic earnings update
        const updatedVendor = await Vendor.findByIdAndUpdate(
          vendorDocId,
          {
            $inc: {
              totalEarnings: data.amount,
              balanceDue: data.amount
            }
          },
          { new: true }
        );

        if (!updatedVendor) {
          console.warn(`[Earnings] Vendor not found for id: ${vendorDocId}`);
          continue;
        }

        // Build item breakdown for this vendor's ledger entry
        const vendorItems = enrichedItems
          .filter(i => i.vendorId.toString() === vendorDocId)
          .map(i => {
            let lineTotal;
            if (i.category === 'Tour') {
              const days = i.selectedDates?.length || 1;
              const gs = i.groupSize || 1;
              lineTotal = (i.priceAtPurchase * gs * days) + (i.deliveryCharge || 0);
            } else if (i.category === 'Accommodation') {
              const nights = i.selectedDates?.length || 1;
              lineTotal = (i.priceAtPurchase * i.quantity * nights) + (i.deliveryCharge || 0);
            } else {
              lineTotal = (i.priceAtPurchase * i.quantity) + (i.deliveryCharge || 0);
            }
            return {
              productId: i.productId,
              name: i.name,
              category: i.category,
              quantity: i.quantity,
              groupSize: i.groupSize || 1,
              priceAtPurchase: i.priceAtPurchase,
              selectedDates: i.selectedDates || [],
              deliveryCharge: i.deliveryCharge || 0,
              lineTotal
            };
          });

        // Create ledger entry with post-update snapshot
        await VendorLedger.create({
          vendorId: vendorDocId,
          orderId: order._id,
          paymentId: payment._id,
          buyerId: order.buyerId,
          amountEarned: data.amount,
          items: vendorItems,
          snapshot: {
            totalEarnings: updatedVendor.totalEarnings,
            totalPaid: updatedVendor.totalPaid,
            balanceDue: updatedVendor.balanceDue
          }
        });

        console.log(`[Ledger] Vendor ${vendorDocId}: +${data.amount} | Balance: ${updatedVendor.balanceDue}`);
      }

      // 4c. Clear buyer's cart
      await Cart.findOneAndUpdate({ userId: order.buyerId }, { items: [] });

      console.log(`[Webhook] Order ${orderId} processed successfully.`);

    } catch (dbError) {
      console.error(`[Webhook] Database error while processing order:`, dbError);
      return res.status(500).send('Database Error');
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send();
};
