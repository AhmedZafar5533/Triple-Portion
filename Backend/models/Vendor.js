const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Onboarding', 'Pending', 'Approved', 'Rejected', 'Disabled', 'Action Required'],
    default: 'Onboarding'
  },
  adminMessage: {
    type: String,
    default: ''
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  acceptanceDate: { type: Date, default: null },
  rejectionDate: { type: Date, default: null },

  // Step 1: Business Details
  businessDetails: {
    businessName: { type: String, trim: true, default: '' },
    legalBusinessName: { type: String, trim: true, default: '' },
    businessType: {
      type: String,
      enum: ['', 'Sole Proprietorship', 'Partnership', 'LLC', 'Corporation', 'Other', 'Custom'],
      default: ''
    },
    businessIndustry: { type: String, trim: true, default: '' },
    registrationNumber: { type: String, trim: true },
    registrationNumberHash: { type: String, unique: true, sparse: true }
  },

  // Step 2: Business Contact
  businessContact: {
    businessEmail: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    businessPhone: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' }
  },

  // Step 3: Owner Information
  ownerDetails: {
    name: { type: String, trim: true, default: '' },
    dateOfBirth: { type: Date, default: null },
    nationality: { type: String, trim: true, default: '' },
    identificationType: {
      type: String,
      enum: ['', 'Passport', "Driver's License", 'National ID'],
      default: ''
    },
    identificationNumber: { type: String, trim: true },
    identificationNumberHash: { type: String, unique: true, sparse: true },
    ownerPhoto: { type: String, default: '' },         // file path
    ownerDocumentPhoto: { type: String, default: '' }  // file path
  },

  // Step 4: Contact Person
  contactPerson: {
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    position: { type: String, trim: true, default: '' }
  },

  // Step 5: Business Address
  businessAddress: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' }
  },

  // Financial Stats
  totalEarnings: { type: Number, default: 0 }, // Total lifetime revenue
  totalPaid: { type: Number, default: 0 },     // Total already transferred to vendor
  balanceDue: { type: Number, default: 0 }     // Outstanding balance
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
