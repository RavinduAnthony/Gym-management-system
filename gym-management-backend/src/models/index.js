const { sequelize } = require('../config/database');
const User = require('./User');
const OTP = require('./OTP');
const Package = require('./Package');
const Payment = require('./Payment');
const Expense = require('./Expense');
const Trainer = require('./Trainer');

// Initialize all models
const models = {
  User,
  OTP,
  Package,
  Payment,
  Expense,
  Trainer
};

// Set up associations if they exist
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
