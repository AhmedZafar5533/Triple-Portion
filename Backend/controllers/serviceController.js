const AvailableService = require('../models/AvailableService');
const Vendor = require('../models/Vendor');

/**
 * GET /api/services/all
 * Admin: Get all services with vendor counts.
 */
exports.getAllServices = async (req, res) => {
  try {
    const services = await AvailableService.find().sort({ createdAt: -1 });
    
    // Auto-seed if empty (optional, keeping it for first-run convenience but removing the manual seed endpoint)
    if (services.length === 0) {
      const initialServices = [
        { name: 'Grocery', description: 'Fresh produce and essentials' },
        { name: 'Accommodation', description: 'Hotel bookings and short-term stays' },
        { name: 'Building Material', description: 'Construction and hardware supplies' },
        { name: 'Tour', description: 'Travel experiences and excursions' },
        { name: 'Electronics', description: 'Gadgets and home appliances' }
      ];
      await AvailableService.insertMany(initialServices);
      const newServices = await AvailableService.find().sort({ createdAt: -1 });
      
      // Add vendor count (0 for new ones)
      const data = newServices.map(s => ({ ...s._doc, vendorCount: 0 }));
      return res.status(200).json({ success: true, data });
    }

    // Get vendor counts for each service
    const servicesWithCounts = await Promise.all(services.map(async (service) => {
      const vendorCount = await Vendor.countDocuments({ 
        'businessDetails.businessIndustry': service.name,
        status: { $ne: 'Disabled' } // Only count active/pending vendors
      });
      return {
        ...service._doc,
        vendorCount
      };
    }));
    
    res.status(200).json({ success: true, data: servicesWithCounts });
  } catch (err) {
    console.error('Get all services error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching services.' });
  }
};

/**
 * GET /api/services/active
 * Public/Vendor: Get only enabled services for onboarding.
 */
exports.getActiveServices = async (req, res) => {
  try {
    const services = await AvailableService.find({ isEnabled: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: services });
  } catch (err) {
    console.error('Get active services error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching active services.' });
  }
};

/**
 * PATCH /api/services/:id/toggle
 * Admin: Enable or disable a service.
 * Cascades disablement to vendors.
 */
exports.toggleServiceStatus = async (req, res) => {
  try {
    const service = await AvailableService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    service.isEnabled = !service.isEnabled;
    await service.save();

    // If disabling, also disable all vendors in this industry AND all products in this category
    if (!service.isEnabled) {
      // 1. Disable vendors
      await Vendor.updateMany(
        { 'businessDetails.businessIndustry': service.name },
        { status: 'Disabled' }
      );
      // 2. Disable products (Admin Disable)
      const Product = require('../models/Product');
      const categoryNames = service.name === 'Building Material' 
        ? ['Building Material', 'Building Material / Plumbing'] 
        : [service.name];
      await Product.updateMany(
        { category: { $in: categoryNames }, adminDisabled: false },
        { 
          adminDisabled: true,
          adminMessage: `SERVICE_DISABLED: ${service.name}`
        }
      );
    } else {
        // If re-enabling, move vendors back to 'Pending'
        await Vendor.updateMany(
            { 'businessDetails.businessIndustry': service.name, status: 'Disabled' },
            { status: 'Pending' }
          );
        // 2. Re-enable products
        const Product = require('../models/Product');
        const categoryNames = service.name === 'Building Material' 
          ? ['Building Material', 'Building Material / Plumbing'] 
          : [service.name];
        await Product.updateMany(
            { 
                category: { $in: categoryNames }, 
                adminDisabled: true, 
                adminMessage: `SERVICE_DISABLED: ${service.name}` 
            },
            { 
              adminDisabled: false, 
              adminMessage: null 
            }
        );
    }

    res.status(200).json({ 
      success: true, 
      message: `Service ${service.isEnabled ? 'enabled' : 'disabled'} and related vendors updated.`,
      data: service 
    });
  } catch (err) {
    console.error('Toggle service error:', err);
    res.status(500).json({ success: false, message: 'Server error toggling service status.' });
  }
};

/**
 * POST /api/services
 * Admin: Add a new service manually.
 */
exports.addService = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, message: 'Service name is required.' });
        }

        const existing = await AvailableService.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Service with this name already exists.' });
        }

        const service = new AvailableService({ name, description });
        await service.save();

        res.status(201).json({ success: true, data: { ...service._doc, vendorCount: 0 } });
    } catch (err) {
        console.error('Add service error:', err);
        res.status(500).json({ success: false, message: 'Server error adding service.' });
    }
};

/**
 * PATCH /api/services/:id/delivery-charge
 * Admin: Update the delivery charge per item for a service.
 */
exports.updateDeliveryCharge = async (req, res) => {
  try {
    const { deliveryChargePerItem, freeDeliveryThreshold } = req.body;
    
    const service = await AvailableService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    if (deliveryChargePerItem !== undefined) {
      if (deliveryChargePerItem < 0) return res.status(400).json({ success: false, message: 'Invalid delivery charge.' });
      service.deliveryChargePerItem = deliveryChargePerItem;
    }

    if (freeDeliveryThreshold !== undefined) {
      if (freeDeliveryThreshold < 0) return res.status(400).json({ success: false, message: 'Invalid threshold.' });
      service.freeDeliveryThreshold = freeDeliveryThreshold;
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Delivery settings updated successfully.',
      data: service
    });
  } catch (err) {
    console.error('Update delivery charge error:', err);
    res.status(500).json({ success: false, message: 'Server error updating delivery charge.' });
  }
};

