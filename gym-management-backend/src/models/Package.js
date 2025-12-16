const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [1, 100],
        msg: 'Package name cannot exceed 100 characters'
      }
    }
  },
  packageType: {
    type: DataTypes.ENUM('basic', 'standard', 'premium', 'custom'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: 1,
        msg: 'Duration must be at least 1 month'
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: 0,
        msg: 'Price cannot be negative'
      }
    }
  },
  features: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Description cannot exceed 500 characters'
      }
    }
  },
  coachingIncluded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Packages',
  timestamps: true
});

module.exports = Package;
