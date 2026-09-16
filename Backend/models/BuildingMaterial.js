const mongoose = require('mongoose');
const Product = require('./Product');

const buildingMaterialSchema = new mongoose.Schema({
  materialType: { type: String }, // Cement, Steel, PVC Pipe, Tiles, etc.
  dimensions: { type: String }, // e.g., "4x4", "20ft", "50mm"
  grade: { type: String }, // e.g., "Grade 42.5", "SDR 21"
  weightPerUnit: { type: String },
  color: { type: String },
  usage: { type: String }, // Indoor, Outdoor, Underground, etc.
  brand: { type: String }
});

const BuildingMaterial = Product.discriminator('Building Material / Plumbing', buildingMaterialSchema);

module.exports = BuildingMaterial;
