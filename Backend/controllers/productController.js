const Product = require('../models/Product');
const AvailableService = require('../models/AvailableService');
const { Electronics, HomeAppliances } = require('../models/Electronics');
const Accommodation = require('../models/Accommodation');
const Tour = require('../models/Tour');
const Grocery = require('../models/Grocery');
const BuildingMaterial = require('../models/BuildingMaterial');
const Vendor = require('../models/Vendor');
const { processAndSaveImage, PRODUCT_DIR, deleteImage } = require('../middleware/upload');
const { validateProduct } = require('../validation/productValidation');
const crypto = require('crypto');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Vendor only)
exports.createProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    console.log(body);
    if (typeof body.specifications === 'string') { try { body.specifications = JSON.parse(body.specifications); } catch (e) {} }
    if (typeof body.features === 'string') { try { body.features = JSON.parse(body.features); } catch (e) {} }
    if (typeof body.warranty === 'string') { try { body.warranty = JSON.parse(body.warranty); } catch (e) {} }
    if (typeof body.tags === 'string') { try { body.tags = JSON.parse(body.tags); } catch (e) {} }
    if (typeof body.itinerary === 'string') { try { body.itinerary = JSON.parse(body.itinerary); } catch (e) {} }
    if (typeof body.included === 'string') { try { body.included = JSON.parse(body.included); } catch (e) {} }
    if (typeof body.excluded === 'string') { try { body.excluded = JSON.parse(body.excluded); } catch (e) {} }
    if (typeof body.languages === 'string') { try { body.languages = JSON.parse(body.languages); } catch (e) {} }
    if (typeof body.availableDates === 'string') { try { body.availableDates = JSON.parse(body.availableDates); } catch (e) {} }
    if (typeof body.dietaryInfo === 'string') { try { body.dietaryInfo = JSON.parse(body.dietaryInfo); } catch (e) {} }
    if (typeof body.nutritionalInfo === 'string') { try { body.nutritionalInfo = JSON.parse(body.nutritionalInfo); } catch (e) {} }

    const { error, value } = validateProduct(body);
    if (error) return res.status(400).json({ message: 'Validation Error', details: error.details.map(d => d.message) });

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
    if (vendor.status !== 'Approved') return res.status(403).json({ message: 'Vendor not approved' });
    const vendorIndustry = vendor.businessDetails?.businessIndustry;
    const isMatched = value.category === vendorIndustry ||
      (vendorIndustry === 'Building Material' && value.category === 'Building Material / Plumbing') ||
      (vendorIndustry === 'Building Material / Plumbing' && value.category === 'Building Material');

    if (!isMatched) {
      return res.status(403).json({ message: `Forbidden. You are registered under '${vendorIndustry}', not '${value.category}'.` });
    }

    const serviceName = value.category === 'Building Material / Plumbing' ? 'Building Material' : value.category;
    const service = await AvailableService.findOne({ name: serviceName });
    if (!service || !service.isEnabled) {
      return res.status(400).json({ message: `Service '${value.category}' is currently disabled or unavailable.` });
    }

    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'At least one image is required' });

    const imageUrls = [];
    try {
      for (const file of req.files) {
        const filename = crypto.randomBytes(16).toString('hex');
        const relativePath = await processAndSaveImage(file.buffer, filename, PRODUCT_DIR);
        imageUrls.push(relativePath);
      }
    } catch (uploadErr) {
      imageUrls.forEach(path => deleteImage(path));
      throw uploadErr;
    }

    const { category, name, price, discountedPrice, description, stock, tags, warranty, specifications, features, brand, modelNumber, condition, ...categorySpecificFields } = value;
    const baseData = { name, price, discountedPrice, description, stock, vendorId: vendor._id, images: imageUrls, category, tags, warranty, specifications, features, brand, modelNumber, condition };

    let product;
    if (category === 'Electronics') {
      product = new Electronics({ ...baseData, ...categorySpecificFields });
    } else if (category === 'Home Appliances') {
      product = new HomeAppliances({ ...baseData, ...categorySpecificFields });
    } else if (category === 'Accommodation') {
      product = new Accommodation({ ...baseData, ...categorySpecificFields });
    } else if (category === 'Tour') {
      product = new Tour({ ...baseData, ...categorySpecificFields });
    } else if (category === 'Grocery') {
      if (categorySpecificFields.expiryDate === '') {
        categorySpecificFields.expiryDate = null;
      }
      product = new Grocery({ ...baseData, ...categorySpecificFields });
    } else if (category === 'Building Material / Plumbing') {
      product = new BuildingMaterial({ ...baseData, ...categorySpecificFields });
    } else {
      product = new Product(baseData);
    }

    await product.save();
    
    // Increment count
    const countServiceName = category === 'Building Material / Plumbing' ? 'Building Material' : category;
    await AvailableService.updateOne({ name: countServiceName }, { $inc: { productCount: 1 } });
    
    let successMessage = 'Product created successfully';
    if (category === 'Tour') successMessage = 'Tour created successfully';
    if (category === 'Accommodation') successMessage = 'Accommodation created successfully';
    if (category === 'Electronics') successMessage = 'Electronics product created successfully';
    if (category === 'Home Appliances') successMessage = 'Home Appliance created successfully';
    if (category === 'Grocery') successMessage = 'Grocery product created successfully';
    if (category === 'Building Material / Plumbing') successMessage = 'Building material created successfully';

    res.status(201).json({ 
      message: successMessage, 
      product 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get products for public display (homepage)
// @route   GET /api/products/display
// @access  Public
// @desc    Get products for public display (homepage with filtering & search)
// @route   GET /api/products/display
// @access  Public
exports.getDisplayProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = {
      availabilityStatus: 'Available',
      adminDisabled: false,
    };

    if (category) {
      // Map category name if needed
      const mappedCategory = category === 'Building Material' ? 'Building Material / Plumbing' : category;
      query.category = mappedCategory;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } },
        { brand: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    }

    // Fetch matching products (fetch up to 200 products to avoid missing ones at the end)
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .select('name category price discountedPrice images brand tags createdAt description rating numReviews stock availabilityStatus adminDisabled availableDates bookedDates dateSlots maxGroupSize')
      .lean();

    // Build category counts (always build complete counts for the filter tabs)
    const allProductsAgg = await Product.aggregate([
      { $match: { availabilityStatus: 'Available', adminDisabled: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const categories = allProductsAgg.map(c => ({
      name: c._id,
      count: c.count,
    }));

    // If a filter is applied, return all matching products in a single list
    if (category || search) {
      return res.json({
        products, // Filtered list
        categories
      });
    }

    // Otherwise (initial homepage load), partition into distinct non-overlapping sections with category-representative randomization
    const shuffleArray = (arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    // Group products by category
    const categoryMap = {};
    products.forEach(p => {
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = [];
      }
      categoryMap[p.category].push(p);
    });

    // Shuffle each category list
    Object.keys(categoryMap).forEach(cat => {
      categoryMap[cat] = shuffleArray(categoryMap[cat]);
    });

    // Extract one seed product from each category to guarantee representation
    const seeds = [];
    Object.keys(categoryMap).forEach(cat => {
      if (categoryMap[cat].length > 0) {
        seeds.push(categoryMap[cat].shift());
      }
    });

    // Shuffle the seeds and remaining products
    const shuffledSeeds = shuffleArray(seeds);
    const remainingPool = shuffleArray(Object.values(categoryMap).flat());

    const trending = [];
    const newArrivals = [];
    const topPicks = [];

    // Distribute the seeds first across sections
    shuffledSeeds.forEach((prod, idx) => {
      if (idx % 3 === 0) trending.push(prod);
      else if (idx % 3 === 1) newArrivals.push(prod);
      else topPicks.push(prod);
    });

    // Fill each section up to 10 products from the remaining pool
    while (remainingPool.length > 0 && (trending.length < 10 || newArrivals.length < 10 || topPicks.length < 10)) {
      const prod = remainingPool.shift();
      if (trending.length < 10) {
        trending.push(prod);
      } else if (newArrivals.length < 10) {
        newArrivals.push(prod);
      } else if (topPicks.length < 10) {
        topPicks.push(prod);
      }
    }

    res.json({
      products, // Full raw list (just in case)
      trending,
      newArrivals,
      topPicks,
      categories
    });
  } catch (err) {
    console.error('Display products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single product by ID (public detail view)
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'businessDetails businessContact')
      .lean();

    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.adminDisabled) return res.status(403).json({ message: 'This product is currently unavailable' });

    res.json({ product });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search products (public, lightweight)
// @route   GET /api/products/search?q=...
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ products: [] });

    const query = q.trim();
    const regex = new RegExp(query, 'i');

    const products = await Product.find({
      $and: [
        { availabilityStatus: 'Available' },
        { adminDisabled: false },
        {
          $or: [
            { name: { $regex: regex } },
            { tags: { $regex: regex } },
            { brand: { $regex: regex } },
            { category: { $regex: regex } }
          ]
        }
      ]
    })
      .select('name category price discountedPrice images brand')
      .limit(20)
      .lean();

    res.json({ products });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Search error' });
  }
};

const { paginate } = require('../utils/pagination');

// @desc    Get vendor's products
exports.getMyProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const { page, limit } = req.query;
    const { results, total, totalPages } = await paginate(Product, { vendorId: vendor._id }, {
      page,
      limit
    });
    res.json({ products: results, total, totalPages, currentPage: parseInt(page) || 1 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a product
// @route   PATCH /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findOne({ userId: req.user.id });
    console.log("here we are")
    let product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.vendorId.toString() !== vendor._id.toString()) return res.status(403).json({ message: 'Forbidden' });

    const body = { ...req.body };
    console.log("BODY", body);
    // Parse nested objects if they are strings
    ['specifications', 'features', 'tags', 'warranty', 'deletedImages', 'itinerary', 'included', 'excluded', 'languages', 'availableDates'].forEach(key => {
      if (typeof body[key] === 'string') { try { body[key] = JSON.parse(body[key]); } catch (e) {} }
    });

    // 1. Handle image deletions
    if (body.deletedImages && Array.isArray(body.deletedImages)) {
      body.deletedImages.forEach(imgUrl => {
        deleteImage(imgUrl);
        product.images = product.images.filter(img => img !== imgUrl);
      });
    }

    // 2. Handle new image uploads
    if (req.files && req.files.length > 0) {
      if (product.images.length + req.files.length > 5) return res.status(400).json({ message: 'Max 5 images allowed' });
      for (const file of req.files) {
        const filename = crypto.randomBytes(16).toString('hex');
        const relativePath = await processAndSaveImage(file.buffer, filename, PRODUCT_DIR);
        product.images.push(relativePath);
      }
    }

    // 3. Update data
    const { error, value } = validateProduct({ ...product._doc, ...body });
    if (error) return res.status(400).json({ message: 'Validation Error', details: error.details.map(d => d.message) });

    // Update fields
    const fieldsToUpdate = [
        'name', 'price', 'discountedPrice', 'description', 'stock', 'tags', 'warranty', 'brand', 'modelNumber', 'specifications', 'features', 
        'energyRating', 'capacity', 
        'propertyType', 'roomType', 'address', 'maxOccupancy', 'numberOfRooms', 'mapsLink', 'checkInTime', 'checkOutTime',
        'duration', 'location', 'itinerary', 'maxGroupSize', 'included', 'excluded', 'difficulty', 'languages', 'availableDates',
        'weight', 'unit', 'expiryDate', 'dietaryInfo', 'storageInstructions', 'nutritionalInfo'
    ];
    fieldsToUpdate.forEach(field => {
      if (value[field] !== undefined) {
        if (field === 'discountedPrice' && (value[field] === '' || value[field] === null || value[field] === 0)) {
           product[field] = undefined; // Clear the discount
        } else if (field === 'expiryDate' && value[field] === '') {
           product[field] = null;
        } else {
           product[field] = value[field];
        }
      }
    });

    await product.save();

    let successMessage = 'Product updated successfully';
    if (product.category === 'Tour') successMessage = 'Tour updated successfully';
    if (product.category === 'Accommodation') successMessage = 'Accommodation updated successfully';
    if (product.category === 'Electronics') successMessage = 'Electronics product updated successfully';
    if (product.category === 'Home Appliances') successMessage = 'Home Appliance updated successfully';
    if (product.category === 'Grocery') successMessage = 'Grocery item updated successfully';
    if (product.category === 'Building Material / Plumbing') successMessage = 'Building material updated successfully';

    res.json({ message: successMessage, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle product availability
exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findOne({ userId: req.user.id });
    
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.vendorId.toString() !== vendor._id.toString()) return res.status(403).json({ message: 'Forbidden' });

    // Can't make available if stock is 0
    if (product.availabilityStatus === 'Unavailable' && product.stock <= 0) {
      return res.status(400).json({ message: 'Cannot make available with 0 stock' });
    }

    const { reason } = req.body;
    const isDisabling = product.availabilityStatus === 'Available';

    if (isDisabling && !reason) {
      return res.status(400).json({ message: 'Reason is required when disabling a product' });
    }

    if (!isDisabling) {
        const service = await AvailableService.findOne({ name: product.category });
        if (service && !service.isEnabled) {
            return res.status(400).json({ message: `Cannot enable this product. The platform has disabled the ${product.category} service.` });
        }
    }

    product.availabilityStatus = isDisabling ? 'Unavailable' : 'Available';
    if (isDisabling) {
      product.disableReason = reason;
    } else {
      product.disableReason = null;
    }
    
    await product.save();

    res.json({ message: `Product is now ${product.availabilityStatus}`, product });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findOne({ userId: req.user.id });
    
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.vendorId.toString() !== vendor._id.toString()) return res.status(403).json({ message: 'Forbidden' });

    // 1. Delete images from disk
    if (product.images && product.images.length > 0) {
      product.images.forEach(imgUrl => deleteImage(imgUrl));
    }

    const category = product.category;

    // 2. Delete from DB
    await Product.findByIdAndDelete(id);

    // Decrement count
    const countServiceName = category === 'Building Material / Plumbing' ? 'Building Material' : category;
    await AvailableService.updateOne({ name: countServiceName }, { $inc: { productCount: -1 } });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Admin: Get all products
// @route   GET /api/products/admin/all
// @access  Private (Admin only)
exports.adminGetAllProducts = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { results, total, totalPages } = await paginate(Product, {}, {
      page,
      limit,
      populate: { path: 'vendorId', select: 'businessDetails businessContact' }
    });
    res.json({ products: results, total, totalPages, currentPage: parseInt(page) || 1 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin: Toggle product disabled status
// @route   PATCH /api/products/admin/:id/toggle-status
// @access  Private (Admin only)
exports.adminToggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { reason } = req.body;
    const isDisabling = !product.adminDisabled;

    if (isDisabling && !reason) {
      return res.status(400).json({ message: 'Reason is required for administrative disabling' });
    }

    if (!isDisabling) {
      // Check if parent service is disabled
      const service = await AvailableService.findOne({ name: product.category });
      if (service && !service.isEnabled) {
        return res.status(400).json({ message: `Cannot enable this product. The parent service (${product.category}) is currently disabled. Please enable the service first.` });
      }
    }

    product.adminDisabled = isDisabling;
    if (isDisabling) {
      product.adminMessage = reason;
    } else {
      product.adminMessage = null;
    }

    await product.save();

    res.json({ 
      message: `Product ${product.adminDisabled ? 'disabled' : 'enabled'} successfully`, 
      product 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
