const Joi = require('joi');
const productBaseSchema = require('./productBaseSchema');

const tourSchema = Joi.object({
  ...productBaseSchema,
  duration: Joi.string().required().messages({
    'string.empty': 'Please specify the tour duration',
    'any.required': 'Duration is required'
  }),
  location: Joi.string().required().messages({
    'string.empty': 'Starting location is required',
    'any.required': 'Location is required'
  }),
  itinerary: Joi.array().items(
    Joi.object({
      day: Joi.number().min(1).required(),
      title: Joi.string().required().messages({ 'string.empty': 'Itinerary title is required' }),
      description: Joi.string().required().messages({ 'string.empty': 'Itinerary description is required' })
    })
  ).min(1).messages({
    'array.min': 'Please add at least one day to the itinerary'
  }),
  maxGroupSize: Joi.number().integer().min(1).required().messages({
    'number.base': 'Group size must be a number',
    'number.min': 'Group size must be at least 1'
  }),
  included: Joi.array().items(Joi.string().required().messages({ 'string.empty': 'Included item description cannot be empty' })).allow(null),
  excluded: Joi.array().items(Joi.string().required().messages({ 'string.empty': 'Excluded item description cannot be empty' })).allow(null),
  difficulty: Joi.string().valid('Easy', 'Moderate', 'Challenging', 'Extreme').default('Easy'),
  languages: Joi.array().items(Joi.string().required().messages({ 'string.empty': 'Language name cannot be empty' })).allow(null),
  availableDates: Joi.array().items(Joi.date().min('now')).min(1).required().messages({
    'array.min': 'Please select at least one available date',
    'date.min': 'Dates cannot be in the past',
    'any.required': 'Available dates are required'
  })
});

module.exports = tourSchema;
