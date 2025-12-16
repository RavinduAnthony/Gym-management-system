const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: 0,
        msg: 'Amount cannot be negative'
      }
    }
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  paymentMonth: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  paymentYear: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'bank_transfer'),
    defaultValue: 'cash'
  },
  status: {
    type: DataTypes.ENUM('paid', 'pending', 'overdue'),
    defaultValue: 'paid'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Notes cannot exceed 500 characters'
      }
    }
  },
  addedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'Payments',
  timestamps: true,
  indexes: [
    {
      fields: ['paymentMonth', 'paymentYear']
    },
    {
      fields: ['userId', 'paymentMonth', 'paymentYear']
    }
  ]
});

// Define associations
Payment.associate = (models) => {
  Payment.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  Payment.belongsTo(models.User, {
    foreignKey: 'addedBy',
    as: 'addedByUser'
  });
};

module.exports = Payment;
