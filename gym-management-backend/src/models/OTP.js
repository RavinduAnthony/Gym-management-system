const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      }
    }
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'OTPs',
  timestamps: true,
  indexes: [
    {
      fields: ['email', 'createdAt']
    }
  ]
});

// Clean up expired OTPs (older than 10 minutes)
OTP.cleanExpired = async function() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  await OTP.destroy({
    where: {
      createdAt: {
        [require('sequelize').Op.lt]: tenMinutesAgo
      }
    }
  });
};

// Run cleanup periodically
setInterval(() => {
  OTP.cleanExpired().catch(err => console.error('OTP cleanup error:', err));
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = OTP;
