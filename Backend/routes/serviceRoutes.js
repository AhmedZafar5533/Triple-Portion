const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifySession, isAdmin } = require('../middleware/auth');

// Public/Vendor routes
router.get('/active', serviceController.getActiveServices);

// Admin only routes
router.get('/all', verifySession, isAdmin, serviceController.getAllServices);
router.post('/', verifySession, isAdmin, serviceController.addService);
router.patch('/:id/toggle', verifySession, isAdmin, serviceController.toggleServiceStatus);
router.patch('/:id/delivery-charge', verifySession, isAdmin, serviceController.updateDeliveryCharge);

module.exports = router;
