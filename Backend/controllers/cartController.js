const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { addToCartSchema, updateQuantitySchema, mergeCartSchema } = require('../validations/cartValidation');

// @desc    Get user's cart
// @route   GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId', 'name price discountedPrice images category availabilityStatus stock vendorId maxGroupSize');
    
    if (!cart) {
      return res.json({ cart: { items: [] }, warnings: [] });
    }

    let modified = false;
    const warnings = [];
    const validItems = [];

    for (const item of cart.items) {
      const product = item.productId;
      
      // 1. If product doesn't exist or is disabled
      if (!product || product.availabilityStatus === 'Disabled') {
        warnings.push(`"${item.name || 'An item'}" is no longer available and was removed.`);
        modified = true;
        continue;
      }

      // 2. Check stock for physical items
      if (product.category !== 'Tour' && product.category !== 'Accommodation') {
        if (product.stock <= 0) {
          warnings.push(`"${product.name}" is out of stock and was removed.`);
          modified = true;
          continue;
        } else if (item.quantity > product.stock) {
          warnings.push(`Only ${product.stock} of "${product.name}" left. Quantity updated.`);
          item.quantity = product.stock;
          modified = true;
        }
      }

      // 3. Sync price
      const currentPrice = product.discountedPrice || product.price;
      if (item.price !== currentPrice) {
        warnings.push(`Price for "${product.name}" changed from ${item.price} to ${currentPrice}.`);
        item.price = currentPrice;
        modified = true;
      }

      validItems.push(item);
    }

    if (modified) {
      cart.items = validItems;
      await cart.save();
    }

    res.json({ cart, warnings });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { error } = addToCartSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

    const idx = cart.items.findIndex(i => i.productId.toString() === productId);
    const currentPrice = product.discountedPrice || product.price;

    if (idx > -1) {
      if (product.category === 'Tour' || product.category === 'Accommodation') {
        cart.items[idx].price = currentPrice;
        if (req.body.selectedDates) {
          cart.items[idx].selectedDates = req.body.selectedDates;
          cart.items[idx].quantity = 1;
        } else if (req.body.selectedDate) {
          cart.items[idx].selectedDates = [req.body.selectedDate];
          cart.items[idx].quantity = 1;
        }
        if (product.category === 'Tour' && req.body.groupSize) {
          cart.items[idx].groupSize = req.body.groupSize;
        }
      } else {
        const newQty = cart.items[idx].quantity + quantity;
        if (product.stock !== undefined && newQty > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
        }
        cart.items[idx].quantity = newQty;
        cart.items[idx].price = currentPrice;
      }
    } else {
      if (['Tour', 'Accommodation'].includes(product.category)) {
        const dates = req.body.selectedDates || (req.body.selectedDate ? [req.body.selectedDate] : []);
        if (dates.length === 0) {
          return res.status(400).json({ message: `Please select at least one date for this ${product.category.toLowerCase()}` });
        }
        cart.items.push({ 
          productId, 
          quantity: 1, 
          price: currentPrice,
          selectedDates: dates,
          groupSize: product.category === 'Tour' ? (req.body.groupSize || 1) : 1
        });
      } else {
        if (product.stock !== undefined && quantity > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
        }
        cart.items.push({ 
          productId, 
          quantity, 
          price: currentPrice
        });
      }
    }

    await cart.save();
    const populated = await Cart.findById(cart._id)
      .populate('items.productId', 'name price discountedPrice images category availabilityStatus stock vendorId maxGroupSize');
    res.json({ cart: populated, warnings: [] });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update item quantity
// @route   PATCH /api/cart
exports.updateQuantity = async (req, res) => {
  try {
    const { error } = updateQuantitySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const idx = cart.items.findIndex(i => i.productId.toString() === productId);
    if (idx === -1) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      const item = cart.items[idx];
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      if (quantity > item.quantity) {
        if (product.category === 'Tour' || product.category === 'Accommodation') {
          return res.status(400).json({ message: 'Quantity for tours and accommodations cannot be increased' });
        }
        if (product.stock !== undefined && quantity > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
        }
      }
      cart.items[idx].quantity = quantity;
    }

    await cart.save();
    const populated = await Cart.findById(cart._id)
      .populate('items.productId', 'name price discountedPrice images category availabilityStatus stock vendorId maxGroupSize');
    res.json({ cart: populated, warnings: [] });
  } catch (err) {
    console.error('Update qty error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.productId.toString() !== req.params.productId);
    await cart.save();

    const populated = await Cart.findById(cart._id)
      .populate('items.productId', 'name price discountedPrice images category availabilityStatus stock vendorId maxGroupSize');
    res.json({ cart: populated, warnings: [] });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Merge guest cart with server cart (called on login/register)
// @route   POST /api/cart/merge
exports.mergeCart = async (req, res) => {
  try {
    const { error } = mergeCartSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { items } = req.body; // [{ productId, quantity, selectedDate }]
    if (!items || !items.length) return res.json({ message: 'Nothing to merge' });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

    for (const guestItem of items) {
      const product = await Product.findById(guestItem.productId);
      if (!product) continue;

      // Enforce tour date on merge
      if (product.category === 'Tour' && !guestItem.selectedDate) continue;

      const idx = cart.items.findIndex(i => i.productId.toString() === guestItem.productId);
      if (idx > -1) {
        if (product.category !== 'Tour' && product.category !== 'Accommodation') {
          const newQty = Math.max(cart.items[idx].quantity, guestItem.quantity);
          cart.items[idx].quantity = (product.stock !== undefined) ? Math.min(newQty, product.stock) : newQty;
        }
        cart.items[idx].price = product.price;
      } else {
        const qty = (product.category === 'Tour' || product.category === 'Accommodation') 
          ? 1 
          : guestItem.quantity;
        cart.items.push({ 
          productId: guestItem.productId, 
          quantity: (product.stock !== undefined) ? Math.min(qty, product.stock) : qty, 
          price: product.discountedPrice || product.price,
          selectedDates: guestItem.selectedDates || (guestItem.selectedDate ? [guestItem.selectedDate] : [])
        });
      }
    }

    await cart.save();
    const populated = await Cart.findById(cart._id)
      .populate('items.productId', 'name price discountedPrice images category availabilityStatus stock vendorId maxGroupSize');
    res.json({ cart: populated, warnings: [] });
  } catch (err) {
    console.error('Merge cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
