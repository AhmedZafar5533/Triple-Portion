const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    required: true,
  },
  onboardingStatus: {
    type: String,
    enum: ['pending', 'completed', 'verified'],
    default: 'pending'
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  profilePic: {
    type: String,
    default: ""
  }
}, { timestamps: true });

userSchema.index({ email: 1, username: 1 })

module.exports = mongoose.model('User', userSchema);
