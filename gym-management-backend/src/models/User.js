const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - mobileNumber
 *         - nicNumber
 *       properties:
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         mobileNumber:
 *           type: string
 *           description: Mobile number (10 digits)
 *         nicNumber:
 *           type: string
 *           description: NIC number (9 digits + V or 12 digits)
 *         address:
 *           type: string
 *           description: User's address
 *         height:
 *           type: number
 *           description: Height in cm (50-300)
 *         weight:
 *           type: number
 *           description: Weight in kg (20-300)
 *         packageType:
 *           type: string
 *           enum: [basic, standard, premium]
 *           description: Membership package type
 *         role:
 *           type: string
 *           enum: [member, trainer, admin]
 *           default: member
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           default: active
 */

const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
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
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  height: {
    type: Number,
    min: [50, 'Height must be at least 50 cm'],
    max: [300, 'Height cannot exceed 300 cm']
  },
  weight: {
    type: Number,
    min: [20, 'Weight must be at least 20 kg'],
    max: [300, 'Weight cannot exceed 300 kg']
  },
  packageType: {
    type: String,
    enum: {
      values: ['basic', 'standard', 'premium'],
      message: 'Package type must be basic, standard, or premium'
    },
    required: [true, 'Package type is required']
  },
  membershipStartDate: {
    type: Date,
    default: Date.now
  },
  membershipEndDate: {
    type: Date
  },
  role: {
    type: String,
    enum: ['member', 'trainer', 'admin', 'coach'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  assignedCoach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedClients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  refreshToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpire: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Calculate membership end date based on package type
userSchema.pre('save', function(next) {
  if (this.isNew && this.packageType) {
    const durationMap = {
      basic: 1,
      standard: 3,
      premium: 12
    };
    
    const months = durationMap[this.packageType] || 1;
    this.membershipEndDate = new Date(this.membershipStartDate);
    this.membershipEndDate.setMonth(this.membershipEndDate.getMonth() + months);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user without sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpire;
  return user;
};

module.exports = mongoose.model('User', userSchema);
