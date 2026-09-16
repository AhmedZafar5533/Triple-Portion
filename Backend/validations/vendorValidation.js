const Joi = require('joi');

// Step 1: Business Information
const businessDetailsSchema = Joi.object({
  businessName: Joi.string().min(2).max(100).required().trim().messages({
    'string.min': 'Business name must be at least 2 characters.',
    'string.max': 'Business name cannot exceed 100 characters.',
    'string.empty': 'Business name is required.',
    'any.required': 'Business name is required.'
  }),
  legalBusinessName: Joi.string().min(2).max(100).required().trim().messages({
    'string.min': 'Legal business name must be at least 2 characters.',
    'string.max': 'Legal business name cannot exceed 100 characters.',
    'string.empty': 'Legal business name is required.',
    'any.required': 'Legal business name is required.'
  }),
  businessType: Joi.string()
    .valid('Sole Proprietorship', 'Partnership', 'LLC', 'Corporation', 'Other', 'Custom')
    .required()
    .messages({
      'any.only': 'Please select a valid business type.',
      'string.empty': 'Business type is required.',
      'any.required': 'Business type is required.'
    }),
  businessIndustry: Joi.string().min(2).max(100).required().trim().messages({
    'string.min': 'Business industry must be at least 2 characters.',
    'string.empty': 'Business industry is required.',
    'any.required': 'Business industry is required.'
  }),
  registrationNumber: Joi.string()
    .pattern(/^[a-zA-Z0-9]{5,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Registration number must be 5-20 alphanumeric characters.',
      'string.empty': 'Registration number is required.',
      'any.required': 'Registration number is required.'
    })
});

// Step 2: Business Contact
const businessContactSchema = Joi.object({
  businessEmail: Joi.string().email().required().trim().messages({
    'string.email': 'Please provide a valid email address.',
    'string.empty': 'Business email is required.',
    'any.required': 'Business email is required.'
  }),
  businessPhone: Joi.string()
    .pattern(/^\+?[\d\s\-().]{7,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number (7-20 digits).',
      'string.empty': 'Business phone is required.',
      'any.required': 'Business phone is required.'
    }),
  website: Joi.string()
    .uri({ allowRelative: false })
    .allow('')
    .optional()
    .messages({
      'string.uri': 'Please enter a valid website URL (e.g., https://example.com).'
    })
});

// Step 3: Owner Information (text fields only — images handled by Multer)
const ownerDetailsSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.min': 'Owner name must be at least 3 characters.',
      'string.max': 'Owner name cannot exceed 50 characters.',
      'string.pattern.base': 'Owner name can only contain letters and spaces.',
      'string.empty': 'Owner name is required.',
      'any.required': 'Owner name is required.'
    }),
  dateOfBirth: Joi.date().max('now').required().messages({
    'date.max': 'Date of birth cannot be in the future.',
    'date.base': 'Please provide a valid date of birth.',
    'any.required': 'Date of birth is required.'
  }),
  nationality: Joi.string().min(2).max(50).required().trim().messages({
    'string.min': 'Nationality must be at least 2 characters.',
    'string.empty': 'Nationality is required.',
    'any.required': 'Nationality is required.'
  }),
  identificationType: Joi.string()
    .valid('Passport', "Driver's License", 'National ID')
    .required()
    .messages({
      'any.only': 'Please select a valid identification type.',
      'string.empty': 'Identification type is required.',
      'any.required': 'Identification type is required.'
    }),
  identificationNumber: Joi.string().min(4).max(30).required().trim().messages({
    'string.min': 'ID number must be at least 4 characters.',
    'string.max': 'ID number cannot exceed 30 characters.',
    'string.empty': 'Identification number is required.',
    'any.required': 'Identification number is required.'
  })
});

// Step 4: Contact Person
const contactPersonSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().trim().messages({
    'string.min': 'Contact name must be at least 3 characters.',
    'string.max': 'Contact name cannot exceed 50 characters.',
    'string.empty': 'Contact person name is required.',
    'any.required': 'Contact person name is required.'
  }),
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Please provide a valid email address.',
    'string.empty': 'Contact email is required.',
    'any.required': 'Contact email is required.'
  }),
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-().]{7,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number.',
      'string.empty': 'Contact phone is required.',
      'any.required': 'Contact phone is required.'
    }),
  position: Joi.string().min(2).max(50).required().trim().messages({
    'string.min': 'Position must be at least 2 characters.',
    'string.max': 'Position cannot exceed 50 characters.',
    'string.empty': 'Position is required.',
    'any.required': 'Position is required.'
  })
});

// Step 5: Business Address
const businessAddressSchema = Joi.object({
  street: Joi.string().min(5).max(200).required().trim().messages({
    'string.min': 'Street address must be at least 5 characters.',
    'string.max': 'Street address cannot exceed 200 characters.',
    'string.empty': 'Street address is required.',
    'any.required': 'Street address is required.'
  }),
  city: Joi.string().min(2).max(100).required().trim().messages({
    'string.min': 'City must be at least 2 characters.',
    'string.empty': 'City is required.',
    'any.required': 'City is required.'
  }),
  state: Joi.string().min(2).max(100).required().trim().messages({
    'string.min': 'State must be at least 2 characters.',
    'string.empty': 'State/Province is required.',
    'any.required': 'State/Province is required.'
  }),
  postalCode: Joi.string().min(3).max(20).required().trim().messages({
    'string.min': 'Postal code must be at least 3 characters.',
    'string.max': 'Postal code cannot exceed 20 characters.',
    'string.empty': 'Postal code is required.',
    'any.required': 'Postal code is required.'
  }),
  country: Joi.string().min(2).max(100).required().trim().messages({
    'string.min': 'Country must be at least 2 characters.',
    'string.empty': 'Country is required.',
    'any.required': 'Country is required.'
  })
});

module.exports = {
  businessDetailsSchema,
  businessContactSchema,
  ownerDetailsSchema,
  contactPersonSchema,
  businessAddressSchema
};
