const mongoose = require('mongoose');
const Product = require('./Product');

const ElectronicsSchema = new mongoose.Schema({
  energyRating: { type: String },
  capacity: { type: String },
});

const Electronics = Product.discriminator('Electronics', ElectronicsSchema);
const HomeAppliances = Product.discriminator('Home Appliances', ElectronicsSchema);

module.exports = { Electronics, HomeAppliances };
