const mongoose = require('mongoose');

const productOptions = {
  discriminatorKey: 'category', // This field will determine the type of product
  timestamps: true
};

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  availabilityStatus: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: 'Available'
  },
  adminDisabled: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative'],
    validate: {
      validator: function(v) {
        return v == null || v < this.price;
      },
      message: 'Discounted price must be less than the regular price'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  images: [{
    type: String // URLs/Paths to images
  }],
  stock: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  warranty: {
    hasWarranty: { type: Boolean, default: false },
    duration: { type: Number }, // Duration in months
    type: { type: String }, // Manufacturer, Seller, etc.
    conditions: [{ type: String }] // Array of rules/conditions
  },
  specifications: [{
    label: String, // e.g., "RAM"
    value: String  // e.g., "16GB"
  }],
  features: [String], // Array of key features/highlights
  brand: {
    type: String,
    trim: true
  },
  modelNumber: {
    type: String
  },
  condition: {
    type: String,
    enum: ['New', 'Refurbished', 'Used'],
    default: 'New'
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  adminMessage: {
    type: String
  },
  disableReason: {
    type: String
  },
  availableDates: {
    type: [Date],
    default: []
  },
  bookedDates: {
    type: [Date],
    default: []
  },
  dateSlots: [{
    date: { type: Date, required: true },
    bookedCount: { type: Number, default: 0 }
  }]
}, productOptions);

// Auto-update availability based on stock
productSchema.pre('save', async function() {
  if (this.category === 'Tour' || this.category === 'Accommodation') {
    return;
  }
  if (this.stock <= 0) {
    this.availabilityStatus = 'Unavailable';
  } else if (this.isModified('stock') && this.stock > 0) {
    // If stock is increased back above 0, make it available if it was auto-set
    this.availabilityStatus = 'Available';
  }
});

// Indexes for optimized searching and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ availabilityStatus: 1 });
productSchema.index({ price: 1 });
productSchema.index({ vendorId: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
