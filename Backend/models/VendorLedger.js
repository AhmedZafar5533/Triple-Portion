const mongoose = require('mongoose');

/**
 * VendorLedger — one entry per vendor per successful checkout.
 * This is the authoritative audit trail that links a vendor's earnings
 * back to the specific order and payment that generated them.
 */
const vendorLedgerSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // What the vendor earned from this specific order
  amountEarned: {
    type: Number,
    required: true
  },

  // Breakdown of the items that belong to this vendor in this order
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    category: String,
    quantity: Number,
    priceAtPurchase: Number,
    selectedDates: [Date],
    deliveryCharge: { type: Number, default: 0 },
    lineTotal: Number // pre-computed: price * qty * datesMultiplier + delivery
  }],

  // Tracking payout status for this specific transaction
  status: {
    type: String,
    enum: ['Unpaid', 'Paid'],
    default: 'Unpaid',
    index: true
  },
  payoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout',
    default: null
  },

  // Snapshot of the vendor's running balance AFTER this transaction was applied
  snapshot: {
    totalEarnings: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('VendorLedger', vendorLedgerSchema);
