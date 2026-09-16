const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { decrypt } = require('../utils/encryption');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { deleteImage } = require('../middleware/upload');
const { paginate } = require('../utils/pagination');

/**
 * GET /api/admin/vendors
 * Fetch vendors by status (Pending, Approved, Rejected, Onboarding, Action Required, Disabled)
 */
exports.getVendors = async (req, res) => {
  try {
    const { status, page, limit, search } = req.query;
    let query = status ? { status } : {};
    
    if (search) {
      query.$or = [
        { 'businessDetails.businessName': { $regex: search, $options: 'i' } },
        { 'businessContact.businessEmail': { $regex: search, $options: 'i' } }
      ];
    }
    
    const { results, total, totalPages } = await paginate(Vendor, query, {
      page,
      limit,
      populate: { path: 'userId', select: 'username email role' }
    });

    res.status(200).json({ 
      vendors: results, 
      total, 
      totalPages, 
      currentPage: parseInt(page) || 1 
    });
  } catch (err) {
    console.error('getVendors error:', err);
    res.status(500).json({ message: 'Server error fetching vendors.' });
  }
};

/**
 * GET /api/admin/vendors/:id
 * Fetch full details for a specific vendor
 */
exports.getVendorDetails = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('userId', 'username email role profilePic');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor application not found.' });
    }
    if (vendor.businessDetails?.registrationNumber) {
      vendor.businessDetails.registrationNumber = decrypt(vendor.businessDetails.registrationNumber);
    }
    if (vendor.ownerDetails?.identificationNumber) {
      vendor.ownerDetails.identificationNumber = decrypt(vendor.ownerDetails.identificationNumber);
    }

    res.status(200).json({ vendor });
  } catch (err) {
    console.error('getVendorDetails error:', err);
    res.status(500).json({ message: 'Server error fetching vendor details.' });
  }
};

/**
 * PATCH /api/admin/vendors/:id/status
 * Approve, Reject, Disable, or Request Correction (Action Required) for a vendor
 */
exports.updateVendorStatus = async (req, res) => {
  try {
    const { status, adminMessage, rejectionReason } = req.body;
    const finalMessage = adminMessage || rejectionReason;
    const allowedStatuses = ['Approved', 'Rejected', 'Disabled', 'Action Required'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    // Enforce reason for Rejection or Action Required
    if ((status === 'Rejected' || status === 'Action Required') && !finalMessage) {
      return res.status(400).json({ message: `A reason/message is mandatory for status: ${status}` });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    // Transition Logic
    vendor.status = status;
    if (finalMessage) {
      vendor.adminMessage = finalMessage;
    }

    if (status === 'Approved') {
      vendor.acceptanceDate = new Date();
      // SECURITY: Delete identity document immediately upon approval
      if (vendor.ownerDetails?.ownerDocumentPhoto) {
        deleteImage(vendor.ownerDetails.ownerDocumentPhoto);
        vendor.ownerDetails.ownerDocumentPhoto = ''; // Clear path from DB
      }
      await User.findByIdAndUpdate(vendor.userId, { onboardingStatus: 'verified' });
    } else if (status === 'Rejected') {
      vendor.rejectionDate = new Date();
      // SECURITY: Delete identity document immediately upon rejection
      if (vendor.ownerDetails?.ownerDocumentPhoto) {
        deleteImage(vendor.ownerDetails.ownerDocumentPhoto);
        vendor.ownerDetails.ownerDocumentPhoto = ''; // Clear path from DB
      }
    }
    
    await vendor.save();

    res.status(200).json({ 
      message: `Vendor status updated to ${status} successfully.`, 
      vendor 
    });
  } catch (err) {
    console.error('updateVendorStatus error:', err);
    res.status(500).json({ message: 'Server error updating vendor status.' });
  }
};

/**
 * DELETE /api/admin/vendors/:id
 * Permanently delete a vendor from the database
 */
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    // Delete associated files if they still exist
    if (vendor.ownerDetails?.ownerPhoto) deleteImage(vendor.ownerDetails.ownerPhoto);
    if (vendor.ownerDetails?.ownerDocumentPhoto) deleteImage(vendor.ownerDetails.ownerDocumentPhoto);

    // Delete the vendor document
    await Vendor.findByIdAndDelete(req.params.id);

    // Note: We typically don't delete the User document, 
    // but we might want to reset their onboarding status.
    await User.findByIdAndUpdate(vendor.userId, { onboardingStatus: 'pending' });

    res.status(200).json({ message: 'Vendor application deleted permanently.' });
  } catch (err) {
    console.error('deleteVendor error:', err);
    res.status(500).json({ message: 'Server error deleting vendor.' });
  }
};
/**
 * GET /api/admin/dashboard-stats
 * Admin: Aggregated statistics for the dashboard overview
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalSalesData = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    const totalSales = totalSalesData.length > 0 ? totalSalesData[0].total : 0;

    // Count only paid orders as "real" orders; track failures separately
    // Order metrics
    const totalOrders = await Order.countDocuments({ paymentStatus: 'Paid' });
    const pendingOrders = await Order.countDocuments({ paymentStatus: 'Unpaid', status: 'Processing' });
    const failedOrders = await Order.countDocuments({ paymentStatus: 'Failed' });

    // User and Vendor metrics (Strictly excluding Admins)
    const totalCustomers = await User.countDocuments({ role: 'buyer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    
    // Vendor document status counts (Business Profiles)
    const totalVendors = await Vendor.countDocuments({ status: 'Approved' });
    const pendingVendors = await Vendor.countDocuments({ status: 'Pending' });
    const onboardingVendors = await Vendor.countDocuments({ status: 'Onboarding' });

    // Revenue by category
    const revenueByCategory = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: '$items' },
      { $group: { 
        _id: '$items.category', 
        total: { 
          $sum: { 
            $multiply: [
              '$items.priceAtPurchase', 
              '$items.quantity', 
              { $cond: [
                { $and: [
                  { $isArray: '$items.selectedDates' },
                  { $gt: [{ $size: '$items.selectedDates' }, 0] }
                ]},
                { $size: '$items.selectedDates' },
                1
              ]}
            ] 
          } 
        } 
      } }
    ]);

    // Top vendors (by sales volume)
    const topVendors = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: '$items' },
      { $group: { 
        _id: '$items.vendorId', 
        totalSales: { 
          $sum: { 
            $multiply: [
              '$items.priceAtPurchase', 
              '$items.quantity', 
              { $cond: [
                { $and: [
                  { $isArray: '$items.selectedDates' },
                  { $gt: [{ $size: '$items.selectedDates' }, 0] }
                ]},
                { $size: '$items.selectedDates' },
                1
              ]}
            ] 
          } 
        }, 
        orderCount: { $sum: 1 } 
      } },
      { $sort: { totalSales: -1 } },
      { $limit: 5 }
    ]);

    // New signups in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersCount = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const recentOrders = await Order.find()
      .populate('buyerId', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find()
      .populate('buyerId', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      stats: {
        totalSales,
        totalOrders,
        pendingOrders,
        failedOrders,
        totalVendors,
        pendingVendors,
        onboardingVendors,
        totalCustomers,
        totalSellers,
        newUsersCount,
        revenueByCategory,
        topVendors
      },
      recentOrders,
      recentPayments
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ message: 'Server error fetching dashboard stats.' });
  }
};

/**
 * GET /api/admin/payments
 * Admin: Fetch all payment records
 */
exports.getPayments = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { buyerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const { results, total, totalPages } = await paginate(Payment, query, {
      page,
      limit,
      populate: { path: 'buyerId', select: 'username email' }
    });
    res.status(200).json({ 
      payments: results, 
      total, 
      totalPages, 
      currentPage: parseInt(page) || 1 
    });
  } catch (err) {
    console.error('getPayments error:', err);
    res.status(500).json({ message: 'Server error fetching payments.' });
  }
};

/**
 * GET /api/admin/serve-secure-image?path=...
 * Admin only: Decrypt and serve sensitive images (like ID documents)
 */
/**
 * POST /api/admin/payouts
 * Admin: Record a new payout to a vendor
 */
exports.createPayout = async (req, res) => {
  try {
    const { vendorId, ledgerEntryIds, paymentMethod, transactionReference, notes } = req.body;
    const adminId = req.user.id;

    if (!ledgerEntryIds || !Array.isArray(ledgerEntryIds) || ledgerEntryIds.length === 0) {
      return res.status(400).json({ message: 'No orders selected for payout' });
    }

    const Vendor = require('../models/Vendor');
    const Payout = require('../models/Payout');
    const VendorLedger = require('../models/VendorLedger');

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    // Find and validate selected ledger entries
    const entries = await VendorLedger.find({
      _id: { $in: ledgerEntryIds },
      vendorId,
      status: 'Unpaid'
    });

    if (entries.length !== ledgerEntryIds.length) {
      return res.status(400).json({ message: 'Some selected orders are invalid or already paid' });
    }

    const totalAmount = entries.reduce((sum, entry) => sum + entry.amountEarned, 0);

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'Total payout amount must be greater than zero' });
    }

    // GUARDRAIL: Prevent duplicate pending payouts (optional, might still be useful)
    const existingPending = await Payout.findOne({ vendorId, status: 'Pending' });
    if (existingPending) {
      return res.status(409).json({ 
        message: 'A payout is already in Pending status for this vendor. Complete or cancel it before creating a new one.' 
      });
    }

    // Capture snapshot BEFORE updating vendor
    const payout = new Payout({
      vendorId,
      adminId,
      amount: totalAmount,
      paymentMethod,
      transactionReference,
      notes,
      ledgerEntryIds,
      snapshot: {
        totalEarningsAtPayout: vendor.totalEarnings,
        totalPaidAtPayout: vendor.totalPaid,
        balanceDueBeforePayout: vendor.balanceDue,
        balanceDueAfterPayout: vendor.balanceDue - totalAmount
      }
    });

    await payout.save();

    // Atomic vendor balance update
    await Vendor.findByIdAndUpdate(vendorId, {
      $inc: {
        totalPaid: totalAmount,
        balanceDue: -totalAmount
      }
    });

    // Mark ledger entries as Paid
    await VendorLedger.updateMany(
      { _id: { $in: ledgerEntryIds } },
      { $set: { status: 'Paid', payoutId: payout._id } }
    );

    res.status(201).json({ message: 'Payout recorded successfully', payout });
  } catch (err) {
    console.error('createPayout error:', err);
    res.status(500).json({ message: 'Server error recording payout' });
  }
};

/**
 * GET /api/admin/vendor-financials/:vendorId
 * Returns vendor info + all ledger entries + payout history for the payout processing page
 */
exports.getVendorFinancials = async (req, res) => {
  try {
    const Vendor = require('../models/Vendor');
    const VendorLedger = require('../models/VendorLedger');
    const Payout = require('../models/Payout');

    const vendor = await Vendor.findById(req.params.vendorId)
      .populate('userId', 'username email');

    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    // All ledger entries (earnings from orders)
    const ledgerEntries = await VendorLedger.find({ vendorId: req.params.vendorId })
      .populate('orderId', 'grandTotal paymentStatus createdAt')
      .populate('buyerId', 'username email')
      .sort({ createdAt: -1 });

    // All payouts made to this vendor
    const payoutHistory = await Payout.find({ vendorId: req.params.vendorId })
      .populate('adminId', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({ vendor, ledgerEntries, payoutHistory });
  } catch (err) {
    console.error('getVendorFinancials error:', err);
    res.status(500).json({ message: 'Server error fetching vendor financials' });
  }
};

/**
 * GET /api/admin/payouts
 * Admin: Fetch payout history
 */
exports.getPayouts = async (req, res) => {
  try {
    const Payout = require('../models/Payout');
    const { page, limit } = req.query;
    const { results, total, totalPages } = await paginate(Payout, {}, {
      page,
      limit,
      populate: [
        { path: 'vendorId', select: 'businessDetails.businessName businessDetails.legalBusinessName' },
        { path: 'adminId', select: 'username email' }
      ]
    });
    
    res.status(200).json({ 
      payouts: results, 
      total, 
      totalPages, 
      currentPage: parseInt(page) || 1 
    });
  } catch (err) {
    console.error('getPayouts error:', err);
    res.status(500).json({ message: 'Server error fetching payouts' });
  }
};

/**
 * GET /api/admin/vendor-ledger/:vendorId
 * Admin: Fetch all ledger entries for a specific vendor
 */
exports.getVendorLedger = async (req, res) => {
  try {
    const VendorLedger = require('../models/VendorLedger');
    const entries = await VendorLedger.find({ vendorId: req.params.vendorId })
      .populate('orderId', 'grandTotal paymentStatus createdAt')
      .populate('buyerId', 'username email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ entries });
  } catch (err) {
    console.error('getVendorLedger error:', err);
    res.status(500).json({ message: 'Server error fetching vendor ledger' });
  }
};

exports.serveDecryptedImage = async (req, res) => {
  try {
    const { path: relativePath } = req.query;
    if (!relativePath) return res.status(400).send('Path is required');

    const path = require('path');
    const fs = require('fs');
    const { decryptBuffer } = require('../utils/encryption');

    const absolutePath = path.resolve(__dirname, '..', relativePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).send('File not found');
    }

    const encryptedBuffer = fs.readFileSync(absolutePath);
    const decryptedBuffer = decryptBuffer(encryptedBuffer);

    res.set('Content-Type', 'image/webp');
    res.send(decryptedBuffer);
  } catch (err) {
    console.error('Decryption error:', err);
    res.status(500).send('Error decrypting image');
  }
};
