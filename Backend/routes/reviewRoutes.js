const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifySession, isAdmin, isSeller } = require('../middleware/auth');

// Protected Specific
router.get('/admin', verifySession, isAdmin, reviewController.getAdminReviews);
router.get('/vendor', verifySession, isSeller, reviewController.getVendorReviews);
router.get('/my-reviews', verifySession, reviewController.getMyReviews);

// Public
router.get('/:productId', reviewController.getProductReviews);

// Protected Parameterized
router.get('/:productId/can-review', verifySession, reviewController.canReview);
router.post('/:productId', verifySession, reviewController.createReview);
router.patch('/:reviewId', verifySession, reviewController.updateReview);

module.exports = router;
