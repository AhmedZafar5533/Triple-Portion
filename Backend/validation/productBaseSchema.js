const Joi = require('joi');

const productBaseSchema = {
  name: Joi.string().required().trim().min(3).max(100).messages({
    'string.empty': 'Product title is required',
    'string.min': 'Product title must be at least 3 characters long',
    'any.required': 'Product title is a required field'
  }),
  price: Joi.number().required().min(0).messages({
    'number.base': 'Price must be a valid number',
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required'
  }),
  discountedPrice: Joi.number().min(0).allow(null, '').messages({
    'number.base': 'Discounted price must be a valid number',
    'number.min': 'Discounted price cannot be negative'
  }),
  description: Joi.string().required().min(10).max(2000).messages({
    'string.empty': 'Please provide a product description',
    'string.min': 'Description should be at least 10 characters long',
    'any.required': 'Description is required'
  }),
  stock: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Quantity must be a valid number',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Stock quantity is required'
  }),
  category: Joi.string().required().valid('Electronics', 'Home Appliances', 'General', 'Accommodation', 'Tour', 'Grocery', 'Building Material / Plumbing').messages({
    'any.only': 'Please select a valid category',
    'any.required': 'Category is required'
  }),
  brand: Joi.string().allow('', null).trim(),
  modelNumber: Joi.string().allow('', null),
  condition: Joi.string().valid('New', 'Refurbished', 'Used').default('New').messages({
    'any.only': 'Please select a valid condition'
  }),
  warranty: Joi.object({
    hasWarranty: Joi.boolean().default(false),
    duration: Joi.number().min(0).allow(null, ''),
    type: Joi.string().allow(null, ''),
    conditions: Joi.array().items(Joi.string()).allow(null)
  }).allow(null),
  specifications: Joi.array().items(
    Joi.object({
      label: Joi.string().required(),
      value: Joi.string().required()
    })
  ).allow(null),
  features: Joi.array().items(Joi.string().optional().messages({
    'string.empty': 'Key feature description cannot be empty'
  })).allow(null),
  tags: Joi.array().items(Joi.string().required()).min(1).max(5).required().messages({
    'array.min': 'At least one SEO tag is required',
    'array.max': 'You can add a maximum of 5 tags',
    'any.required': 'SEO tags are required'
  })
};

module.exports = productBaseSchema;
