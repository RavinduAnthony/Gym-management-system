const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - category
 *         - amount
 *         - description
 *       properties:
 *         category:
 *           type: string
 *           enum: [equipment, maintenance, utilities, salaries, rent, supplies, other]
 *         amount:
 *           type: number
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         addedBy:
 *           type: string
 *           description: Reference to User (admin or coach)
 *         month:
 *           type: number
 *         year:
 *           type: number
 */

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['equipment', 'maintenance', 'utilities', 'salaries', 'rent', 'supplies', 'other'],
    required: [true, 'Category is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  year: {
    type: Number
  }
}, {
  timestamps: true
});

// Set month and year before saving
expenseSchema.pre('save', function(next) {
  if (this.isNew) {
    const date = this.date || new Date();
    this.month = date.getMonth() + 1;
    this.year = date.getFullYear();
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
