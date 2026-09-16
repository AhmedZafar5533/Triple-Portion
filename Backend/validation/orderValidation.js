const Joi = require('joi');

const validateOrder = (data) => {
  const schema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        image: Joi.string().allow('', null),
        quantity: Joi.number().integer().min(1).required(),
        priceAtPurchase: Joi.number().min(0).required(),
        deliveryCharge: Joi.number().min(0).default(0),
        category: Joi.string().required(),
        selectedDate: Joi.date().iso().optional(),
        selectedDates: Joi.array().items(Joi.date().iso()).optional(),
        groupSize: Joi.number().integer().min(1).optional(),
        vendorId: Joi.string().required()
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      fullName: Joi.string().required(),
      phone: Joi.string().required(),
      address: Joi.string().allow('').optional(),
      city: Joi.string().allow('').optional(),
      district: Joi.string().allow('').optional()
    }).required(),
    totalAmount: Joi.number().min(0).required(),
    totalDeliveryFee: Joi.number().min(0).required(),
    grandTotal: Joi.number().min(0).required(),
    paymentMethod: Joi.string().valid('Card', 'Mobile Money', 'Wallet', 'Stripe').required()
  });

  return schema.validate(data);
};

module.exports = { validateOrder };
