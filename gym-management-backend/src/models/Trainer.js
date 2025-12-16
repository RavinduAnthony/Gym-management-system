const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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

const Trainer = sequelize.define('Trainer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: {
        args: [1, 50],
        msg: 'First name cannot exceed 50 characters'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: {
        args: [1, 50],
        msg: 'Last name cannot exceed 50 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      }
    }
  },
  mobileNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      is: {
        args: /^\d{10}$/,
        msg: 'Mobile number must be 10 digits'
      }
    }
  },
  nicNumber: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true,
    validate: {
      is: {
        args: /^(\d{9}[vVxX]|\d{12})$/,
        msg: 'Invalid NIC format'
      }
    }
  },
  specialization: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: 0,
        msg: 'Experience cannot be negative'
      }
    }
  },
  certification: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: 0,
        msg: 'Hourly rate cannot be negative'
      }
    }
  },
  availability: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Bio cannot exceed 500 characters'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'Trainers',
  timestamps: true
});

module.exports = Trainer;
