const Joi = require('joi');

const addToCartSchema = Joi.object({
  productId: Joi.string().required().hex().length(24).messages({
    'string.base': 'Product ID must be a string',
    'string.empty': 'Product ID is required',
    'string.hex': 'Invalid Product ID format',
    'string.length': 'Invalid Product ID length',
    'any.required': 'Product ID is required'
  }),
  quantity: Joi.number().integer().min(1).default(1),
  selectedDate: Joi.date().iso().allow(null, ''),
  selectedDates: Joi.array().items(Joi.date().iso()).allow(null),
  groupSize: Joi.number().integer().min(1).default(1)
});

const updateQuantitySchema = Joi.object({
  productId: Joi.string().required().hex().length(24),
  quantity: Joi.number().integer().min(0).required()
});

const mergeCartSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required().hex().length(24),
      quantity: Joi.number().integer().min(1).required(),
      selectedDate: Joi.date().iso().allow(null, ''),
      selectedDates: Joi.array().items(Joi.date().iso()).allow(null)
    })
  ).required()
});

module.exports = {
  addToCartSchema,
  updateQuantitySchema,
  mergeCartSchema
};
