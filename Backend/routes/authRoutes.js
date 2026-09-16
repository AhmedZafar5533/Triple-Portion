const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifySession } = require('../middleware/auth');
const { profileUpload } = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

// Strict rate limiter for auth (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: 'Too many attempts from this IP, please try again after 15 minutes.'
});

// @route   POST /api/auth/register
// @desc    Register a new user (auto-login)
router.post('/register', authLimiter, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', authLimiter, authController.login);

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', authController.logout);

// @route   GET /api/auth/me
// @desc    Get current logged in user (Session protected)
router.get('/me', verifySession, authController.getCurrentUser);

// @route   POST /api/auth/profile-pic
// @desc    Upload profile picture
router.post('/profile-pic', verifySession, profileUpload.single('profilePic'), authController.uploadProfilePic);

module.exports = router;
