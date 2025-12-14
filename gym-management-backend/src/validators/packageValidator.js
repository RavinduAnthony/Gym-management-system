const Joi = require('joi');

const createPackageSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Package name is required',
      'string.max': 'Package name cannot exceed 100 characters'
    }),
  packageType: Joi.string()
    .valid('basic', 'standard', 'premium', 'custom')
    .required()
    .messages({
      'string.empty': 'Package type is required',
      'any.only': 'Invalid package type'
    }),
  duration: Joi.number()
    .min(1)
    .required()
    .messages({
      'number.min': 'Duration must be at least 1 month',
      'any.required': 'Duration is required'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  features: Joi.array()
    .items(Joi.string())
    .optional(),
  description: Joi.string()
    .max(500)
    .optional(),
  coachingIncluded: Joi.boolean()
    .optional(),
  isActive: Joi.boolean()
    .optional()
});

const updatePackageSchema = Joi.object({
  name: Joi.string().max(100),
  packageType: Joi.string().valid('basic', 'standard', 'premium', 'custom'),
  duration: Joi.number().min(1),
  price: Joi.number().min(0),
  features: Joi.array().items(Joi.string()),
  description: Joi.string().max(500),
  coachingIncluded: Joi.boolean(),
  isActive: Joi.boolean()
});

module.exports = {
  createPackageSchema,
  updatePackageSchema
};
