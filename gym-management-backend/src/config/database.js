const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/gym_management', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL database connected successfully');
    console.log('✅ PostgreSQL database connected successfully');
    
    // Sync all models with the database (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synchronized');
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL:', error);
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
};

// Handle connection errors
sequelize.on('error', (err) => {
  logger.error('PostgreSQL connection error:', err);
});

module.exports = { sequelize, connectDB };
