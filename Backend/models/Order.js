const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the vendor's user account
    required: true
  },
  name: String,
  image: String,
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  category: String,
  groupSize: { type: Number, default: 1 },
  selectedDates: [Date],
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Checked-in', 'Checked-out', 'Completed'],
    default: 'Pending'
  },
  cancelReason: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  totalDeliveryFee: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    district: { type: String }
  },
  
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid', 'Failed'],
    default: 'Unpaid'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  
  status: {
    type: String,
    enum: ['Processing', 'Completed', 'Cancelled'],
    default: 'Processing'
  }
}, { timestamps: true });

// Index for performance
orderSchema.index({ buyerId: 1 });
orderSchema.index({ 'items.vendorId': 1 });

module.exports = mongoose.model('Order', orderSchema);
