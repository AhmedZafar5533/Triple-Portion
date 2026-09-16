const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { encrypt, hash } = require('../utils/encryption');
const { processAndSaveImage, deleteImage, UPLOAD_DIR, PROFILE_DIR } = require('../middleware/upload');
const {
  businessDetailsSchema,
  businessContactSchema,
  ownerDetailsSchema,
  contactPersonSchema,
  businessAddressSchema
} = require('../validations/vendorValidation');

/**
 * POST /api/vendor/initialize
 * Create a new vendor doc or return existing one.
 */
exports.initialize = async (req, res) => {
  try {
    const userId = req.user.id;

    let vendor = await Vendor.findOne({ userId });

    if (vendor) {
      return res.status(200).json({
        message: 'Vendor data loaded.',
        vendor,
        isNew: false
      });
    }

    // Create new vendor doc
    vendor = new Vendor({ userId, status: 'Onboarding', currentStep: 1 });
    await vendor.save();

    res.status(201).json({
      message: 'Onboarding initialized successfully.',
      vendor,
      isNew: true
    });
  } catch (err) {
    console.error('Vendor initialize error:', err);
    res.status(500).json({ message: 'Server error during initialization.' });
  }
};

/**
 * GET /api/vendor/me
 * Get current vendor data for the logged-in seller.
 */
exports.getVendorData = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
      return res.status(404).json({ message: 'No vendor record found.' });
    }

    res.status(200).json({ vendor });
  } catch (err) {
    console.error('Get vendor error:', err);
    res.status(500).json({ message: 'Server error fetching vendor data.' });
  }
};

/**
 * POST /api/vendor/step/1 — Business Details
 */
exports.saveStep1 = async (req, res) => {
  try {
    const { error, value } = businessDetailsSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ message: messages[0], errors: messages });
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found. Please initialize first.' });

    // Encrypt registration number and save hash
    if (value.registrationNumber) {
      vendor.businessDetails.registrationNumber = encrypt(value.registrationNumber);
      vendor.businessDetails.registrationNumberHash = hash(value.registrationNumber);
    }
    
    // Copy other fields
    vendor.businessDetails.businessName = value.businessName;
    vendor.businessDetails.legalBusinessName = value.legalBusinessName;
    vendor.businessDetails.businessType = value.businessType;
    vendor.businessDetails.businessIndustry = value.businessIndustry;

    if (vendor.currentStep < 2) vendor.currentStep = 2;
    await vendor.save();

    req.session.vendorIndustry = value.businessIndustry;

    res.status(200).json({ message: 'Business details saved.', vendor });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A vendor with this registration number already exists.' });
    }
    console.error('Step 1 error:', err);
    res.status(500).json({ message: 'Server error saving business details.' });
  }
};

/**
 * POST /api/vendor/step/2 — Business Contact
 */
exports.saveStep2 = async (req, res) => {
  try {
    const { error, value } = businessContactSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ message: messages[0], errors: messages });
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });

    vendor.businessContact = value;
    if (vendor.currentStep < 3) vendor.currentStep = 3;
    await vendor.save();

    res.status(200).json({ message: 'Business contact saved.', vendor });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'This business email is already registered to another vendor.' });
    }
    console.error('Step 2 error:', err);
    res.status(500).json({ message: 'Server error saving business contact.' });
  }
};

/**
 * POST /api/vendor/step/3 — Owner Information (with image uploads)
 */
exports.saveStep3 = async (req, res) => {
  try {
    const { error, value } = ownerDetailsSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ message: messages[0], errors: messages });
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });

    // Process uploaded images
    const files = req.files || {};
    const timestamp = Date.now();

    // Process ownerPhoto
    if (files.ownerPhoto && files.ownerPhoto[0]) {
      const filename = `owner_${req.user.id}_${timestamp}`;
      value.ownerPhoto = await processAndSaveImage(
        files.ownerPhoto[0].buffer, filename, UPLOAD_DIR
      );
    } else if (req.body.ownerPhoto === "") {
      // Explicitly removed by user
      if (vendor.ownerDetails?.ownerPhoto) {
        deleteImage(vendor.ownerDetails.ownerPhoto);
      }
      value.ownerPhoto = "";
    } else if (vendor.ownerDetails?.ownerPhoto) {
      // Keep existing photo
      value.ownerPhoto = vendor.ownerDetails.ownerPhoto;
    }

    // Process ownerDocumentPhoto
    if (files.ownerDocumentPhoto && files.ownerDocumentPhoto[0]) {
      const filename = `doc_${req.user.id}_${timestamp}`;
      value.ownerDocumentPhoto = await processAndSaveImage(
        files.ownerDocumentPhoto[0].buffer, filename, UPLOAD_DIR, true // Encrypt document
      );
    } else if (req.body.ownerDocumentPhoto === "") {
      // Explicitly removed by user
      if (vendor.ownerDetails?.ownerDocumentPhoto) {
        deleteImage(vendor.ownerDetails.ownerDocumentPhoto);
      }
      value.ownerDocumentPhoto = "";
    } else if (vendor.ownerDetails?.ownerDocumentPhoto) {
      // Keep existing
      value.ownerDocumentPhoto = vendor.ownerDetails.ownerDocumentPhoto;
    }

    // Encrypt identification number and save hash
    if (value.identificationNumber) {
      value.identificationNumberHash = hash(value.identificationNumber);
      value.identificationNumber = encrypt(value.identificationNumber);
    }

    vendor.ownerDetails = value;
    if (vendor.currentStep < 4) vendor.currentStep = 4;
    await vendor.save();

    res.status(200).json({ message: 'Owner information saved.', vendor });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'This identification number is already linked to another vendor.' });
    }
    console.error('Step 3 error:', err);
    res.status(500).json({ message: 'Server error saving owner information.' });
  }
};

/**
 * POST /api/vendor/step/4 — Contact Person
 */
exports.saveStep4 = async (req, res) => {
  try {
    const { error, value } = contactPersonSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ message: messages[0], errors: messages });
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });

    vendor.contactPerson = value;
    if (vendor.currentStep < 5) vendor.currentStep = 5;
    await vendor.save();

    res.status(200).json({ message: 'Contact person saved.', vendor });
  } catch (err) {
    console.error('Step 4 error:', err);
    res.status(500).json({ message: 'Server error saving contact person.' });
  }
};

/**
 * POST /api/vendor/step/5 — Business Address (final step)
 * Also updates vendor status to Pending and user onboardingStatus to completed.
 */
exports.saveStep5 = async (req, res) => {
  try {
    const { error, value } = businessAddressSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ message: messages[0], errors: messages });
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });

    vendor.businessAddress = value;
    vendor.currentStep = 5;
    vendor.status = 'Pending';
    vendor.adminMessage = ''; // Clear the correction/rejection message once submitted
    await vendor.save();

    // Update user's onboarding status
    await User.findByIdAndUpdate(req.user.id, { onboardingStatus: 'completed' });

    res.status(200).json({
      message: 'Onboarding completed! Your application is now under review.',
      vendor
    });
  } catch (err) {
    console.error('Step 5 error:', err);
    res.status(500).json({ message: 'Server error saving business address.' });
  }
};

/**
 * POST /api/vendor/delete-image
 * Delete a specific onboarding image from disk and DB.
 */
exports.deleteVendorImage = async (req, res) => {
  try {
    const { field } = req.body;
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });

    // Ensure we are only deleting allowed fields in ownerDetails
    const allowedFields = ['ownerPhoto', 'ownerDocumentPhoto'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field for deletion.' });
    }

    const pathToDelete = vendor.ownerDetails?.[field];
    if (pathToDelete) {
      deleteImage(pathToDelete);
      vendor.ownerDetails[field] = "";
      await vendor.save();
      return res.status(200).json({ message: 'Image deleted.', vendor });
    }

    res.status(400).json({ message: 'Image not found or already deleted.' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ message: 'Server error deleting image.' });
  }
};

/**
 * POST /api/vendor/submit-corrections
 * Manually submit corrections to change status from 'Action Required' back to 'Pending'
 */
exports.submitCorrections = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });

    if (vendor.status !== 'Action Required' && vendor.status !== 'Rejected') {
      return res.status(400).json({ message: 'No corrections needed at this time.' });
    }

    vendor.status = 'Pending';
    vendor.adminMessage = ''; // Clear message on re-submission
    await vendor.save();

    res.status(200).json({ 
      message: 'Corrections submitted! Your application is back under review.', 
      vendor 
    });
  } catch (err) {
    console.error('Submit corrections error:', err);
    res.status(500).json({ message: 'Server error submitting corrections.' });
  }
};

