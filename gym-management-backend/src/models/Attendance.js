const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: Reference to User
 *         checkInTime:
 *           type: string
 *           format: date-time
 *         checkOutTime:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: number
 *           description: Duration in minutes
 */

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  checkOutTime: {
    type: Date
  },
  duration: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate duration before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkOutTime && this.checkInTime) {
    this.duration = Math.round((this.checkOutTime - this.checkInTime) / 60000);
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
