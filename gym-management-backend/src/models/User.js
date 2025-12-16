const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

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

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: {
        args: [3, 20],
        msg: 'Username must be between 3 and 20 characters'
      }
    }
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
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters'
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
  address: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: {
        args: [1, 200],
        msg: 'Address cannot exceed 200 characters'
      }
    }
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: {
        args: 50,
        msg: 'Height must be at least 50 cm'
      },
      max: {
        args: 300,
        msg: 'Height cannot exceed 300 cm'
      }
    }
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: {
        args: 20,
        msg: 'Weight must be at least 20 kg'
      },
      max: {
        args: 300,
        msg: 'Weight cannot exceed 300 kg'
      }
    }
  },
  packageType: {
    type: DataTypes.ENUM('basic', 'standard', 'premium'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['basic', 'standard', 'premium']],
        msg: 'Package type must be basic, standard, or premium'
      }
    }
  },
  membershipStartDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  membershipEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('member', 'trainer', 'admin', 'coach'),
    defaultValue: 'member'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  assignedCoachId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpire: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Users',
  timestamps: true
});

// Hash password before saving
User.beforeSave(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Calculate membership end date before creation
User.beforeCreate(async (user) => {
  if (user.packageType) {
    const durationMap = {
      basic: 1,
      standard: 3,
      premium: 12
    };
    
    const months = durationMap[user.packageType] || 1;
    const endDate = new Date(user.membershipStartDate || new Date());
    endDate.setMonth(endDate.getMonth() + months);
    user.membershipEndDate = endDate;
  }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON output
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.refreshToken;
  delete values.passwordResetToken;
  delete values.passwordResetExpire;
  return values;
};

// Define associations
User.associate = (models) => {
  // Self-referencing relationship for coach-client
  User.belongsTo(models.User, {
    as: 'assignedCoach',
    foreignKey: 'assignedCoachId'
  });
  
  User.hasMany(models.User, {
    as: 'assignedClients',
    foreignKey: 'assignedCoachId'
  });
};

module.exports = User;
