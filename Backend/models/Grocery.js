const mongoose = require('mongoose');
const Product = require('./Product');

const grocerySchema = new mongoose.Schema({
  weight: { type: String }, // e.g., "1kg", "500ml"
  unit: { 
    type: String, 
    enum: ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bottle', 'box'],
    default: 'pcs'
  },
  expiryDate: { type: Date },
  dietaryInfo: [{ type: String }], // e.g., ["Organic", "Halal", "Vegan"]
  storageInstructions: { type: String },
  brand: { type: String },
  nutritionalInfo: {
    calories: { type: String },
    fat: { type: String },
    protein: { type: String },
    carbs: { type: String }
  }
});

const Grocery = Product.discriminator('Grocery', grocerySchema);

module.exports = Grocery;
