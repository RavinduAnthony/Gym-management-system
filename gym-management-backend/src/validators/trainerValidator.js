const Joi = require('joi');

const createTrainerSchema = Joi.object({
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
  specialization: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one specialization is required'
    }),
  experience: Joi.number()
    .min(0),
  certification: Joi.array()
    .items(Joi.string()),
  hourlyRate: Joi.number()
    .min(0),
  availability: Joi.array()
    .items(Joi.object({
      day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
      startTime: Joi.string(),
      endTime: Joi.string()
    })),
  bio: Joi.string()
    .max(500)
});

const updateTrainerSchema = Joi.object({
  firstName: Joi.string().max(50),
  lastName: Joi.string().max(50),
  email: Joi.string().email(),
  mobileNumber: Joi.string().pattern(/^\d{10}$/),
  nicNumber: Joi.string().pattern(/^(\d{9}[vVxX]|\d{12})$/),
  specialization: Joi.array().items(Joi.string()),
  experience: Joi.number().min(0),
  certification: Joi.array().items(Joi.string()),
  hourlyRate: Joi.number().min(0),
  availability: Joi.array().items(Joi.object({
    day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    startTime: Joi.string(),
    endTime: Joi.string()
  })),
  bio: Joi.string().max(500),
  status: Joi.string().valid('active', 'inactive')
});

module.exports = {
  createTrainerSchema,
  updateTrainerSchema
};
