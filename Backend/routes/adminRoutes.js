const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifySession, isAdmin } = require('../middleware/auth');

// All admin routes require an active session and admin role
router.use(verifySession);
router.use(isAdmin);

/**
 * @route GET /api/admin/vendors
 * @desc Get list of vendors (filterable by status)
 */
router.get('/vendors', adminController.getVendors);

/**
 * @route GET /api/admin/vendors/:id
 * @desc Get detailed vendor info
 */
router.get('/vendors/:id', adminController.getVendorDetails);

/**
 * @route PATCH /api/admin/vendors/:id/status
 * @desc Approve or reject a vendor
 */
router.patch('/vendors/:id/status', adminController.updateVendorStatus);
router.delete('/vendors/:id', adminController.deleteVendor);

// Dashboard Stats
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/payments', adminController.getPayments);

// Payout Management
router.get('/payouts', adminController.getPayouts);
router.post('/payouts', adminController.createPayout);

// Vendor Ledger (earnings audit trail)
router.get('/vendor-ledger/:vendorId', adminController.getVendorLedger);

// Vendor financial summary (for payout processing page)
router.get('/vendor-financials/:vendorId', adminController.getVendorFinancials);

router.get('/serve-secure-image', adminController.serveDecryptedImage);

module.exports = router;
