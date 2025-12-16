const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 20 characters'
    }),
  firstName: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  lastName: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    }),
  mobileNumber: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Mobile number must be 10 digits'
    }),
  nicNumber: Joi.string()
    .pattern(/^(\d{9}[vVxX]|\d{12})$/)
    .required()
    .messages({
      'string.empty': 'NIC number is required',
      'string.pattern.base': 'NIC must be 9 digits followed by V/X or 12 digits'
    }),
  address: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.empty': 'Address is required',
      'string.max': 'Address cannot exceed 200 characters'
    }),
  height: Joi.number()
    .min(50)
    .max(300)
    .messages({
      'number.min': 'Height must be at least 50 cm',
      'number.max': 'Height cannot exceed 300 cm'
    }),
  weight: Joi.number()
    .min(20)
    .max(300)
    .messages({
      'number.min': 'Weight must be at least 20 kg',
      'number.max': 'Weight cannot exceed 300 kg'
    }),
  packageType: Joi.string()
    .valid('basic', 'standard', 'premium')
    .required()
    .messages({
      'string.empty': 'Package type is required',
      'any.only': 'Package type must be basic, standard, or premium'
    })
});

const loginSchema = Joi.object({
  identifier: Joi.string()
    .messages({
      'string.empty': 'Username or email is required'
    }),
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
}).or('identifier', 'email'); // Require at least one of identifier or email

const updateUserSchema = Joi.object({
  firstName: Joi.string().max(50),
  lastName: Joi.string().max(50),
  email: Joi.string().email(),
  mobileNumber: Joi.string().pattern(/^\d{10}$/),
  nicNumber: Joi.string().pattern(/^(\d{9}[vVxX]|\d{12})$/),
  address: Joi.string().max(200),
  height: Joi.number().min(50).max(300),
  weight: Joi.number().min(20).max(300),
  packageType: Joi.string().valid('basic', 'standard', 'premium'),
  status: Joi.string().valid('active', 'inactive', 'suspended')
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema
};
