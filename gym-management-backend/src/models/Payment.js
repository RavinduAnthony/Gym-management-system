const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - userId
 *         - amount
 *         - paymentMonth
 *         - paymentYear
 *       properties:
 *         userId:
 *           type: string
 *           description: Reference to User (client)
 *         amount:
 *           type: number
 *         paymentDate:
 *           type: string
 *           format: date
 *         paymentMonth:
 *           type: number
 *         paymentYear:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, bank_transfer]
 *         status:
 *           type: string
 *           enum: [paid, pending, overdue]
 *         notes:
 *           type: string
 *         addedBy:
 *           type: string
 *           description: Reference to User (admin or coach)
 */

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMonth: {
    type: Number,
    required: [true, 'Payment month is required'],
    min: 1,
    max: 12
  },
  paymentYear: {
    type: Number,
    required: [true, 'Payment year is required']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'paid'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient month/year queries
paymentSchema.index({ paymentMonth: 1, paymentYear: 1 });
paymentSchema.index({ userId: 1, paymentMonth: 1, paymentYear: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
