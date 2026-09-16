const mongoose = require('mongoose');

const orderReportSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['Delayed Delivery', 'Wrong Item', 'Damaged Item', 'Quality Issue', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Investigating', 'Resolved'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('OrderReport', orderReportSchema);
