const Joi = require('joi');
const productBaseSchema = require('./productBaseSchema');

const grocerySchema = Joi.object({
  ...productBaseSchema,
  weight: Joi.number().min(0).allow('', null).messages({
    'number.min': 'Weight cannot be negative'
  }),
  unit: Joi.string().valid('kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bottle', 'box').when('weight', {
    is: Joi.number().greater(0),
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'any.only': 'Please select a valid unit',
    'any.required': 'Unit is required when weight is provided'
  }),
  expiryDate: Joi.date().min('now').allow(null, '').messages({
    'date.min': 'Expiry date cannot be in the past'
  }),
  dietaryInfo: Joi.array().items(Joi.string().optional().messages({
    'string.empty': 'Dietary info item cannot be empty'
  })).allow(null),
  storageInstructions: Joi.string().allow('', null),
  nutritionalInfo: Joi.object({
    calories: Joi.string().allow('', null),
    fat: Joi.string().allow('', null),
    protein: Joi.string().allow('', null),
    carbs: Joi.string().allow('', null)
  }).allow(null)
});

module.exports = grocerySchema;
