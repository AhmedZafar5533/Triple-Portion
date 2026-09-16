const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifySession, authorizeRoles } = require('../middleware/auth');
const { productUpload } = require('../middleware/upload');

// Public routes (no auth required)
router.get('/display', productController.getDisplayProducts);
router.get('/search', productController.searchProducts);

// Specific protected routes (must be before /:id)
router.get(
  '/my-products', 
  verifySession, 
  authorizeRoles('seller'), 
  productController.getMyProducts
);

router.get('/:id', productController.getProductById);

// All routes below are protected
router.use(verifySession);

router.post(
  '/', 
  authorizeRoles('seller'), 
  productUpload.array('images', 5), 
  productController.createProduct
);

router.patch(
  '/:id', 
  authorizeRoles('seller'), 
  productUpload.array('images', 5), // Allow adding new images during update
  productController.updateProduct
);

router.delete(
  '/:id',
  authorizeRoles('seller'),
  productController.deleteProduct
);

router.patch(
  '/:id/toggle-availability',
  authorizeRoles('seller'),
  productController.toggleAvailability
);

// Admin routes
router.get(
  '/admin/all',
  authorizeRoles('admin'),
  productController.adminGetAllProducts
);

router.patch(
  '/admin/:id/toggle-status',
  authorizeRoles('admin'),
  productController.adminToggleProductStatus
);

module.exports = router;
