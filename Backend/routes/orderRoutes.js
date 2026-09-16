const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifySession, authorizeRoles } = require('../middleware/auth');

router.post('/checkout', verifySession, orderController.createOrder);
router.get('/my-orders', verifySession, orderController.getBuyerOrders);
router.get('/vendor', verifySession, authorizeRoles('seller'), orderController.getVendorOrders);
router.get('/admin', verifySession, authorizeRoles('admin'), orderController.getAdminOrders);
router.patch('/:orderId/item-status', verifySession, authorizeRoles('seller'), orderController.updateOrderItemStatus);
router.post('/:orderId/report', verifySession, orderController.reportOrder);

module.exports = router;
