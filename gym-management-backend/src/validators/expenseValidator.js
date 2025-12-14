const Joi = require('joi');

const createExpenseSchema = Joi.object({
  category: Joi.string()
    .valid('equipment', 'maintenance', 'utilities', 'salaries', 'rent', 'supplies', 'other')
    .required()
    .messages({
      'string.empty': 'Category is required',
      'any.only': 'Invalid category'
    }),
  amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative',
      'any.required': 'Amount is required'
    }),
  description: Joi.string()
    .max(500)
    .required()
    .messages({
      'string.empty': 'Description is required',
      'string.max': 'Description cannot exceed 500 characters'
    }),
  date: Joi.date()
    .optional()
});

const updateExpenseSchema = Joi.object({
  category: Joi.string().valid('equipment', 'maintenance', 'utilities', 'salaries', 'rent', 'supplies', 'other'),
  amount: Joi.number().min(0),
  description: Joi.string().max(500),
  date: Joi.date()
});

module.exports = {
  createExpenseSchema,
  updateExpenseSchema
};
