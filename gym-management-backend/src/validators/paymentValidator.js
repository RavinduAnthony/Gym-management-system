const Joi = require('joi');

const createPaymentSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'string.empty': 'User ID is required'
    }),
  amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative',
      'any.required': 'Amount is required'
    }),
  paymentDate: Joi.date()
    .optional(),
  paymentMonth: Joi.number()
    .min(1)
    .max(12)
    .required()
    .messages({
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12',
      'any.required': 'Payment month is required'
    }),
  paymentYear: Joi.number()
    .min(2020)
    .required()
    .messages({
      'number.min': 'Invalid year',
      'any.required': 'Payment year is required'
    }),
  paymentMethod: Joi.string()
    .valid('cash', 'card', 'bank_transfer')
    .optional(),
  status: Joi.string()
    .valid('paid', 'pending', 'overdue')
    .optional(),
  notes: Joi.string()
    .max(500)
    .optional()
});

const updatePaymentSchema = Joi.object({
  amount: Joi.number().min(0),
  paymentDate: Joi.date(),
  paymentMonth: Joi.number().min(1).max(12),
  paymentYear: Joi.number().min(2020),
  paymentMethod: Joi.string().valid('cash', 'card', 'bank_transfer'),
  status: Joi.string().valid('paid', 'pending', 'overdue'),
  notes: Joi.string().max(500)
});

module.exports = {
  createPaymentSchema,
  updatePaymentSchema
};
