const Joi = require('joi');
const productBaseSchema = require('./productBaseSchema');

const buildingMaterialSchema = Joi.object({
  ...productBaseSchema,
  materialType: Joi.string().required().messages({
    'string.empty': 'Material type is required'
  }),
  dimensions: Joi.string().allow('', null),
  grade: Joi.string().allow('', null),
  weightPerUnit: Joi.string().allow('', null),
  color: Joi.string().allow('', null),
  usage: Joi.string().allow('', null)
});

module.exports = buildingMaterialSchema;
