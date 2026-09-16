const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  buyerEmail: {
    type: String,
    required: true
  },
  // Mapping of vendors involved in the transaction
  vendors: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    vendorEmail: String,
    amount: Number // Share of this vendor in the total
  }],
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'UGX'
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentMethod: {
    type: String, // e.g., 'Mobile Money', 'Card', 'Wallet'
    default: 'Card'
  },
  failureReason: String,
  // Sensitive data - Admin only access is enforced at controller level
  paymentDetails: {
    cardNumberMasked: String,
    cardType: String,
    authCode: String,
    gatewayResponse: Object
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
