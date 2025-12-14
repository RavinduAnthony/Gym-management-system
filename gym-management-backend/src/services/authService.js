const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

      const token = this.generateToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

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
  async login(email, password) {
    try {
      // Find user and include password
      const user = await User.findOne({ email }).select('+password');

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

      const token = this.generateToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

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
      
      const user = await User.findById(decoded.id).select('+refreshToken');

      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const newToken = this.generateToken(user._id);
      const newRefreshToken = this.generateRefreshToken(user._id);

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
      await User.findByIdAndUpdate(userId, { refreshToken: null });
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Error logging out:', error);
      throw error;
    }
  }

  // Generate password reset token
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      
      user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      await user.save();

      return resetToken;
    } catch (error) {
      logger.error('Error in forgot password:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(resetToken, newPassword) {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: { $gt: Date.now() }
      });

      if (!user) {
        throw new ApiError(400, 'Invalid or expired reset token');
      }

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      
      await user.save();

      return { message: 'Password reset successful' };
    } catch (error) {
      logger.error('Error resetting password:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
