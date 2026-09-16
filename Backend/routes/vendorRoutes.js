const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { verifySession, isSeller } = require('../middleware/auth');
const { vendorUpload, profileUpload } = require('../middleware/upload');

// All routes require authentication + seller role
router.use(verifySession, isSeller);

// Initialize onboarding (create or fetch vendor doc)
router.post('/initialize', vendorController.initialize);

// Get current vendor data
router.get('/me', vendorController.getVendorData);

// Step-based onboarding saves
router.post('/step/1', vendorController.saveStep1);
router.post('/step/2', vendorController.saveStep2);

// Step 3 has image uploads
router.post('/step/3',
  vendorUpload.fields([
    { name: 'ownerPhoto', maxCount: 1 },
    { name: 'ownerDocumentPhoto', maxCount: 1 }
  ]),
  vendorController.saveStep3
);

router.post('/step/4', vendorController.saveStep4);
router.post('/step/5', vendorController.saveStep5);
router.post('/submit-corrections', vendorController.submitCorrections);
router.post('/delete-image', verifySession, isSeller, vendorController.deleteVendorImage);


module.exports = router;
