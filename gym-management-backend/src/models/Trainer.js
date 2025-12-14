const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Trainer:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - mobileNumber
 *         - specialization
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         mobileNumber:
 *           type: string
 *         nicNumber:
 *           type: string
 *         specialization:
 *           type: array
 *           items:
 *             type: string
 *         experience:
 *           type: number
 *           description: Years of experience
 *         certification:
 *           type: array
 *           items:
 *             type: string
 *         hourlyRate:
 *           type: number
 *         availability:
 *           type: array
 *           items:
 *             type: object
 *         status:
 *           type: string
 *           enum: [active, inactive]
 */

const trainerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^\d{10}$/, 'Mobile number must be 10 digits']
  },
  nicNumber: {
    type: String,
    required: [true, 'NIC number is required'],
    unique: true,
    match: [/^(\d{9}[vVxX]|\d{12})$/, 'Invalid NIC format']
  },
  specialization: [{
    type: String,
    required: true
  }],
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative']
  },
  certification: [{
    type: String
  }],
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative']
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trainer', trainerSchema);
