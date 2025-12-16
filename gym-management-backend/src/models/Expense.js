const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.ENUM('equipment', 'maintenance', 'utilities', 'salaries', 'rent', 'supplies', 'other'),
    allowNull: false
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
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [1, 500],
        msg: 'Description cannot exceed 500 characters'
      }
    }
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  addedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 12
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Expenses',
  timestamps: true
});

// Set month and year before creation
Expense.beforeCreate((expense) => {
  const date = expense.date || new Date();
  expense.month = date.getMonth() + 1;
  expense.year = date.getFullYear();
});

// Define associations
Expense.associate = (models) => {
  Expense.belongsTo(models.User, {
    foreignKey: 'addedBy',
    as: 'addedByUser'
  });
};

module.exports = Expense;
