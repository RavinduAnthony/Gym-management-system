const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class UserService {
  // Create new user
  async createUser(userData) {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  // Get all users with pagination and filtering
  async getAllUsers(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      packageType,
      status,
      role
    } = options;

    try {
      const where = {};

      // Search by name or email
      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Filter by package type
      if (packageType) {
        where.packageType = packageType;
      }

      // Filter by status
      if (status) {
        where.status = status;
      }

      // Filter by role
      if (role) {
        where.role = role;
      }

      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpire'] },
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']]
      });

      return {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpire'] }
      });
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      return user;
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id, updateData) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      await user.update(updateData);
      
      // Reload to exclude sensitive fields
      await user.reload({
        attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpire'] }
      });

      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      await user.destroy();

      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      // Group by package type
      const packageStats = await User.findAll({
        attributes: [
          'packageType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['packageType'],
        raw: true
      });

      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { status: 'active' } });
      const totalClients = await User.count({ where: { role: 'member' } });
      const totalCoaches = await User.count({ where: { role: 'coach' } });

      // Format stats to match expected structure
      const byPackage = packageStats.map(stat => ({
        _id: stat.packageType,
        count: parseInt(stat.count)
      }));

      return {
        total: totalUsers,
        active: activeUsers,
        totalClients,
        totalCoaches,
        byPackage
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Assign coach to client
  async assignCoachToClient(clientId, coachId) {
    try {
      // Verify coach exists and has coach role
      const coach = await User.findByPk(coachId);
      if (!coach || coach.role !== 'coach') {
        throw new ApiError(400, 'Invalid coach ID');
      }

      // Update client with assigned coach
      const client = await User.findByPk(clientId);

      if (!client) {
        throw new ApiError(404, 'Client not found');
      }

      client.assignedCoachId = coachId;
      await client.save();

      // Reload to exclude sensitive fields
      await client.reload({
        attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpire'] }
      });

      return client;
    } catch (error) {
      logger.error('Error assigning coach to client:', error);
      throw error;
    }
  }

  // Get clients assigned to a coach
  async getCoachClients(coachId) {
    try {
      const clients = await User.findAll({
        where: { 
          assignedCoachId: coachId,
          role: 'member'
        },
        attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpire'] },
        order: [['createdAt', 'DESC']]
      });

      return clients;
    } catch (error) {
      logger.error('Error getting coach clients:', error);
      throw error;
    }
  }

  // Get all coaches
  async getAllCoaches() {
    try {
      const coaches = await User.findAll({
        where: {
          role: 'coach',
          status: 'active'
        },
        attributes: ['id', 'firstName', 'lastName', 'email', 'mobileNumber'],
        order: [['firstName', 'ASC']]
      });

      return coaches;
    } catch (error) {
      logger.error('Error getting coaches:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
