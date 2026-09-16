const Joi = require('joi');
const productBaseSchema = require('./productBaseSchema');

const electronicsSchema = Joi.object({
  ...productBaseSchema,
  energyRating: Joi.string().allow('', null),
  capacity: Joi.string().allow('', null),
});

module.exports = electronicsSchema;
