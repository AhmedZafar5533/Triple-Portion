const mongoose = require('mongoose');

const availableServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  deliveryChargePerItem: {
    type: Number,
    default: 0
  },
  freeDeliveryThreshold: {
    type: Number,
    default: 0 // 0 means no free delivery threshold
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AvailableService', availableServiceSchema);
