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
      const query = {};

      // Search by name or email
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by package type
      if (packageType) {
        query.packageType = packageType;
      }

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by role
      if (role) {
        query.role = role;
      }

      const users = await User.find(query)
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await User.countDocuments(query);

      return {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
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
      const user = await User.findById(id).select('-password');
      
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
      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const user = await User.findByIdAndDelete(id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: '$packageType',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ status: 'active' });
      const totalClients = await User.countDocuments({ role: 'member' });
      const totalCoaches = await User.countDocuments({ role: 'coach' });

      return {
        total: totalUsers,
        active: activeUsers,
        totalClients,
        totalCoaches,
        byPackage: stats
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
      const coach = await User.findById(coachId);
      if (!coach || coach.role !== 'coach') {
        throw new ApiError(400, 'Invalid coach ID');
      }

      // Update client with assigned coach
      const client = await User.findByIdAndUpdate(
        clientId,
        { assignedCoach: coachId },
        { new: true }
      ).select('-password');

      if (!client) {
        throw new ApiError(404, 'Client not found');
      }

      // Add client to coach's assigned clients
      if (!coach.assignedClients.includes(clientId)) {
        coach.assignedClients.push(clientId);
        await coach.save();
      }

      return client;
    } catch (error) {
      logger.error('Error assigning coach to client:', error);
      throw error;
    }
  }

  // Get clients assigned to a coach
  async getCoachClients(coachId) {
    try {
      const clients = await User.find({ assignedCoach: coachId, role: 'member' })
        .select('-password')
        .sort({ createdAt: -1 });

      return clients;
    } catch (error) {
      logger.error('Error getting coach clients:', error);
      throw error;
    }
  }

  // Get all coaches
  async getAllCoaches() {
    try {
      const coaches = await User.find({ role: 'coach', status: 'active' })
        .select('firstName lastName email mobileNumber specialization')
        .sort({ firstName: 1 });

      return coaches;
    } catch (error) {
      logger.error('Error getting coaches:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
