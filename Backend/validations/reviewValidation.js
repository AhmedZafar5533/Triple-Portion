const Joi = require('joi');

const addReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be at most 5',
    'any.required': 'Rating is required'
  }),
  comment: Joi.string().min(3).max(1000).required().messages({
    'string.base': 'Comment must be a string',
    'string.empty': 'Comment cannot be empty',
    'string.min': 'Comment must be at least 3 characters long',
    'string.max': 'Comment is too long',
    'any.required': 'Comment is required'
  })
});

module.exports = {
  addReviewSchema
};
