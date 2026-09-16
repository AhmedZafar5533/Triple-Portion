const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifySession } = require('../middleware/auth');

router.use(verifySession);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.patch('/', cartController.updateQuantity);
router.delete('/clear', cartController.clearCart);
router.post('/merge', cartController.mergeCart);
router.delete('/:productId', cartController.removeFromCart);

module.exports = router;
