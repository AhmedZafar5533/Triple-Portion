const User = require('../models/User');
const Vendor = require('../models/Vendor');
const bcrypt = require('bcrypt');
const { processAndSaveImage, deleteImage, PROFILE_DIR } = require('../middleware/upload');
const { registerSchema, loginSchema } = require('../validations/authValidation');

exports.register = async (req, res) => {
  try {
    // Validate input data
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with that email or username already exists' });
    }

    // Hash password with strong salt rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      onboardingStatus: role === 'buyer' ? 'verified' : 'pending',
      otpVerified: false,
      profilePic: ''
    });

    await newUser.save();

    // Persist session in MongoStore
    req.session.userId = newUser._id;
    req.session.role = newUser.role;
    req.session.email = newUser.email;

    // For Admins: Security measure to clear session on browser close
    if (newUser.role === 'admin') {
      req.session.cookie.maxAge = null;
    }

    res.status(201).json({
      message: 'Account created successfully',
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role,
        onboardingStatus: newUser.onboardingStatus,
        otpVerified: newUser.otpVerified,
        profilePic: newUser.profilePic
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Persist session in MongoStore
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.email = user.email;

    // For Admins: Security measure to clear session on browser close
    if (user.role === 'admin') {
      req.session.cookie.maxAge = null;
    }

    const userData = { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        onboardingStatus: user.onboardingStatus,
        otpVerified: user.otpVerified,
        profilePic: user.profilePic
    };

    if (user.role === 'seller') {
      const vendor = await Vendor.findOne({ userId: user._id });
      if (vendor) {
        userData.vendorStatus = vendor.status;
        userData.adminMessage = vendor.adminMessage;
        if (vendor.businessDetails) {
            req.session.vendorIndustry = vendor.businessDetails.businessIndustry;
        }
      }
      userData.vendorIndustry = req.session.vendorIndustry;
    }

    res.status(200).json({
      message: 'Logged in successfully',
      user: userData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.logout = (req, res) => {
  // Destroy the MongoStore session
  req.session.destroy();

  res.clearCookie('connect.sid'); // Clear the session cookie
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.getCurrentUser = async (req, res) => {
  // req.user is set by the verifyToken middleware
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ user: null });
    }
    const userData = { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        onboardingStatus: user.onboardingStatus,
        otpVerified: user.otpVerified,
        profilePic: user.profilePic
    };

    // If seller, attach vendor status and industry
    if (user.role === 'seller') {
      const vendor = await Vendor.findOne({ userId: user._id });
      if (vendor) {
        userData.vendorStatus = vendor.status;
        userData.adminMessage = vendor.adminMessage;
      }
      userData.vendorIndustry = req.session.vendorIndustry;
    }

    res.json({ user: userData });
  } catch (err) {
    res.status(401).json({ user: null });
  }
};

/**
 * POST /api/auth/profile-pic
 * Upload and update user profile picture.
 */
exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    const user = await User.findById(req.user.id);
    if (user && user.profilePic) {
      deleteImage(user.profilePic);
    }

    const filename = `profile_${req.user.id}_${Date.now()}`;
    const relativePath = await processAndSaveImage(
      req.file.buffer, filename, PROFILE_DIR
    );

    await User.findByIdAndUpdate(req.user.id, { profilePic: relativePath });

    res.status(200).json({
      message: 'Profile picture updated.',
      profilePic: relativePath
    });
  } catch (err) {
    console.error('Profile pic error:', err);
    res.status(500).json({ message: err.message || 'Server error uploading profile picture.' });
  }
};
