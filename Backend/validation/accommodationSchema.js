const Joi = require('joi');
const productBaseSchema = require('./productBaseSchema');

const accommodationSchema = Joi.object({
  ...productBaseSchema,
  propertyType: Joi.string().required().messages({
    'string.empty': 'Please specify the property type',
    'any.required': 'Property type is required'
  }),
  roomType: Joi.string().required().messages({
    'string.empty': 'Please specify the room type',
    'any.required': 'Room type is required'
  }),
  address: Joi.string().required().messages({
    'string.empty': 'Property address is required',
    'any.required': 'Address is required'
  }),
  checkInTime: Joi.string().allow('', null),
  checkOutTime: Joi.string().allow('', null),
  maxOccupancy: Joi.number().integer().min(1).required().messages({
    'number.base': 'Maximum occupancy must be a number',
    'number.min': 'Occupancy must be at least 1 person',
    'any.required': 'Maximum occupancy is required'
  }),
  numberOfRooms: Joi.number().integer().min(1).allow(null).messages({
    'number.base': 'Available rooms must be a number',
    'number.min': 'There must be at least 1 room'
  }),
  mapsLink: Joi.string().uri().allow('', null).trim().messages({
    'string.uri': 'Please provide a valid Google Maps URL'
  }),
  availableDates: Joi.array().items(Joi.date().min('now')).min(1).required().messages({
    'array.min': 'Please select at least one available date',
    'date.min': 'Dates cannot be in the past',
    'any.required': 'Available dates are required'
  })
});

module.exports = accommodationSchema;
