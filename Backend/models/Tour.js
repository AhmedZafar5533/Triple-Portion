const mongoose = require('mongoose');
const Product = require('./Product');

const Tour = Product.discriminator('Tour', new mongoose.Schema({
  duration: {
    type: String, // e.g., '3 Days', '4 Hours'
    required: [true, 'Duration is required']
  },
  location: {
    type: String,
    required: [true, 'Starting location is required']
  },
  itinerary: [{
    day: Number,
    title: String,
    description: String
  }],
  maxGroupSize: {
    type: Number,
    required: [true, 'Max group size is required']
  },
  included: [String],
  excluded: [String],
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging', 'Extreme'],
    default: 'Easy'
  },
  languages: [String]
}));

module.exports = Tour;
