const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be positive']
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Mobile Money', 'Cash', 'Other'],
    default: 'Bank Transfer'
  },
  transactionReference: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Completed'
  },
  notes: {
    type: String,
    trim: true
  },
  // Snapshot of vendor's financial state at the moment of payout
  // (useful for audit trails even after live balance changes)
  snapshot: {
    totalEarningsAtPayout: { type: Number, default: 0 },
    totalPaidAtPayout: { type: Number, default: 0 },
    balanceDueBeforePayout: { type: Number, default: 0 },
    balanceDueAfterPayout: { type: Number, default: 0 }
  },
  // List of specific order transactions included in this payout
  ledgerEntryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorLedger'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
