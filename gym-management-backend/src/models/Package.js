const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Package:
 *       type: object
 *       required:
 *         - name
 *         - duration
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         packageType:
 *           type: string
 *           enum: [basic, standard, premium, custom]
 *         duration:
 *           type: number
 *           description: Duration in months
 *         price:
 *           type: number
 *         features:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *         coachingIncluded:
 *           type: boolean
 *         isActive:
 *           type: boolean
 */

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true,
    maxlength: [100, 'Package name cannot exceed 100 characters']
  },
  packageType: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'custom'],
    required: [true, 'Package type is required']
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
  coachingIncluded: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);
