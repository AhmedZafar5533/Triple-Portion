const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Username should be text.',
    'string.empty': 'Username cannot be empty.',
    'string.min': 'Username must be at least 3 characters long.',
    'string.max': 'Username cannot exceed 30 characters.',
    'any.required': 'Username is required.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'string.empty': 'Email cannot be empty.',
    'any.required': 'Email is required.'
  }),
  password: Joi.string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 6 characters and include a number.',
      'string.empty': 'Password cannot be empty.',
      'any.required': 'Password is required.'
    }),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match.',
    'any.required': 'Confirm password is required.'
  }),
  role: Joi.string().valid('buyer', 'seller').required().messages({
    'any.only': 'Please select a valid account type (buyer or seller).',
    'string.empty': 'Role selection cannot be empty.',
    'any.required': 'Role selection is required.'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'string.empty': 'Email cannot be empty.',
    'any.required': 'Email is required.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty.',
    'any.required': 'Password is required.'
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
