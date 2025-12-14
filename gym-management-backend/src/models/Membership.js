const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Membership:
 *       type: object
 *       required:
 *         - packageType
 *         - duration
 *         - price
 *       properties:
 *         packageType:
 *           type: string
 *           enum: [basic, standard, premium]
 *         duration:
 *           type: number
 *           description: Duration in months
 *         price:
 *           type: number
 *           description: Price in USD
 *         features:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 */

const membershipSchema = new mongoose.Schema({
  packageType: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: [true, 'Package type is required'],
    unique: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 month']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  features: [{
    type: String
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Membership', membershipSchema);
