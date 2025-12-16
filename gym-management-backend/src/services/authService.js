const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class AuthService {
  // Generate JWT token
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }

  // Generate refresh token
  generateRefreshToken(id) {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
    });
  }

  // Register new user
  async register(userData) {
    try {
      const user = await User.create(userData);

      const token = this.generateToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      return {
        user: user.toJSON(),
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }

  // Login user
  async login(identifier, password) {
    try {
      // Find user by email or username
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: identifier }, { username: identifier }]
        }
      });

      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check password
      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new ApiError(403, 'Account is not active');
      }

      const token = this.generateToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      return {
        user: user.toJSON(),
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('Error logging in:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await User.findByPk(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const newToken = this.generateToken(user.id);
      const newRefreshToken = this.generateRefreshToken(user.id);

      user.refreshToken = newRefreshToken;
      await user.save();

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  // Logout
  async logout(userId) {
    try {
      await User.update({ refreshToken: null }, { where: { id: userId } });
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Error logging out:', error);
      throw error;
    }
  }

  // Generate OTP for password reset
  async forgotPassword(email) {
    try {
      const OTP = require('../models/OTP');
      
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save OTP to database
      await OTP.create({ email, otp });

      // TODO: Send OTP via email (integrate with email service)
      logger.info(`OTP for ${email}: ${otp}`);
      
      return { message: 'OTP sent to your email', otp }; // Remove otp in production
    } catch (error) {
      logger.error('Error in forgot password:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const OTP = require('../models/OTP');
      
      const otpRecord = await OTP.findOne({ 
        where: { 
          email, 
          otp,
          verified: false 
        },
        order: [['createdAt', 'DESC']]
      });

      if (!otpRecord) {
        throw new ApiError(400, 'Invalid or expired OTP');
      }

      // Mark OTP as verified
      otpRecord.verified = true;
      await otpRecord.save();

      return { message: 'OTP verified successfully' };
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      throw error;
    }
  }

  // Reset password with OTP
  async resetPassword(email, otp, newPassword) {
    try {
      const OTP = require('../models/OTP');
      
      // Check if OTP was verified
      const otpRecord = await OTP.findOne({ 
        where: { 
          email, 
          otp,
          verified: true 
        },
        order: [['createdAt', 'DESC']]
      });

      if (!otpRecord) {
        throw new ApiError(400, 'OTP not verified or expired');
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      user.password = newPassword;
      await user.save();

      // Delete used OTPs for this email
      await OTP.destroy({ where: { email } });

      return { message: 'Password reset successful' };
    } catch (error) {
      logger.error('Error resetting password:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
