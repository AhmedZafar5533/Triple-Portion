const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { addReviewSchema } = require('../validations/reviewValidation');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Low limit to test pagination
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'username profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({ productId: req.params.productId });

    res.json({ 
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if user can review a product
// @route   GET /api/reviews/:productId/can-review
// @access  Private
exports.canReview = async (req, res) => {
  try {
    // Check if user has purchased this product
    const order = await Order.findOne({
      buyerId: req.user.id,
      'items.productId': req.params.productId,
      paymentStatus: 'Paid'
    });
    if (!order) return res.json({ canReview: false, reason: 'You must purchase this product before reviewing.' });

    // Check if already reviewed
    const existing = await Review.findOne({ userId: req.user.id, productId: req.params.productId });
    if (existing) return res.json({ canReview: false, alreadyReviewed: true, review: existing, reason: 'You have already reviewed this product.' });

    res.json({ canReview: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a review
// @route   POST /api/reviews/:productId
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { error } = addReviewSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { rating, comment } = req.body;
    const productId = req.params.productId;

    // Verify purchase
    const order = await Order.findOne({
      buyerId: req.user.id,
      'items.productId': productId,
      paymentStatus: 'Paid'
    });
    if (!order) return res.status(403).json({ message: 'You must purchase this product before reviewing.' });

    // Check duplicate
    const existing = await Review.findOne({ userId: req.user.id, productId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product.' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = new Review({
      userId: req.user.id,
      productId,
      vendorId: product.vendorId,
      rating,
      comment
    });
    await review.save();

    // Recalculate product rating
    const allReviews = await Review.find({ productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    product.numReviews = allReviews.length;
    await product.save();

    const populated = await Review.findById(review._id).populate('userId', 'username profilePic');
    res.status(201).json({ message: 'Review submitted successfully', review: populated });
  } catch (err) {
    console.error('Create review error:', err);
    if (err.code === 11000) return res.status(400).json({ message: 'You have already reviewed this product.' });
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a review
// @route   PATCH /api/reviews/:reviewId
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { error } = addReviewSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { rating, comment } = req.body;
    const review = await Review.findOne({ _id: req.params.reviewId, userId: req.user.id });

    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Recalculate product rating
    const productId = review.productId;
    const allReviews = await Review.find({ productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: allReviews.length
    });

    const populated = await Review.findById(review._id).populate('userId', 'username profilePic');
    res.json({ message: 'Review updated successfully', review: populated });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const { paginate } = require('../utils/pagination');

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin
// @access  Private/Admin
exports.getAdminReviews = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { results, total, totalPages } = await paginate(Review, {}, {
      page,
      limit,
      populate: [
        { path: 'userId', select: 'username email' },
        { path: 'productId', select: 'name' }
      ]
    });
    res.json({ reviews: results, total, totalPages, currentPage: parseInt(page) || 1 });
  } catch (err) {
    console.error('Admin reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get vendor reviews
// @route   GET /api/reviews/vendor
// @access  Private/Seller
exports.getVendorReviews = async (req, res) => {
  try {
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const { page, limit } = req.query;
    const { results, total, totalPages } = await paginate(Review, { vendorId: vendor._id }, {
      page,
      limit,
      populate: [
        { path: 'userId', select: 'username' },
        { path: 'productId', select: 'name' }
      ]
    });
    res.json({ reviews: results, total, totalPages, currentPage: parseInt(page) || 1 });
  } catch (err) {
    console.error('Vendor reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's own reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { results, total, totalPages } = await paginate(Review, { userId: req.user.id }, {
      page,
      limit,
      populate: { path: 'productId', select: 'name images category' }
    });
    res.json({ reviews: results, total, totalPages, currentPage: parseInt(page) || 1 });
  } catch (err) {
    console.error('My reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
