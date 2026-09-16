const mongoose = require('mongoose');
const Product = require('./Product');

const Accommodation = Product.discriminator('Accommodation', new mongoose.Schema({
  propertyType: {
    type: String, // e.g., 'Hotel', 'Resort', 'Villa', 'Apartment', 'Guesthouse'
    required: [true, 'Property type is required']
  },
  roomType: {
    type: String, // e.g., 'Single', 'Double', 'Suite', 'Entire Place', 'Studio'
    required: [true, 'Room type is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  checkInTime: {
    type: String, // e.g., '14:00'
    default: '14:00'
  },
  checkOutTime: {
    type: String, // e.g., '11:00'
    default: '11:00'
  },
  maxOccupancy: {
    type: Number,
    required: [true, 'Max occupancy is required'],
    min: [1, 'Max occupancy must be at least 1']
  },
  numberOfRooms: {
    type: Number,
    min: [1, 'Number of rooms must be at least 1'],
    default: 1
  },
  mapsLink: {
    type: String,
    trim: true
  }
}));

module.exports = Accommodation;
