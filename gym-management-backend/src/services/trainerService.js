const Trainer = require('../models/Trainer');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class TrainerService {
  // Create new trainer
  async createTrainer(trainerData) {
    try {
      const trainer = await Trainer.create(trainerData);
      return trainer;
    } catch (error) {
      logger.error('Error creating trainer:', error);
      throw error;
    }
  }

  // Get all trainers with pagination and filtering
  async getAllTrainers(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      specialization,
      status
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

      // Filter by specialization
      if (specialization) {
        query.specialization = { $in: [specialization] };
      }

      // Filter by status
      if (status) {
        query.status = status;
      }

      const trainers = await Trainer.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await Trainer.countDocuments(query);

      return {
        trainers,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      };
    } catch (error) {
      logger.error('Error getting trainers:', error);
      throw error;
    }
  }

  // Get trainer by ID
  async getTrainerById(id) {
    try {
      const trainer = await Trainer.findById(id);
      
      if (!trainer) {
        throw new ApiError(404, 'Trainer not found');
      }

      return trainer;
    } catch (error) {
      logger.error('Error getting trainer by ID:', error);
      throw error;
    }
  }

  // Update trainer
  async updateTrainer(id, updateData) {
    try {
      const trainer = await Trainer.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!trainer) {
        throw new ApiError(404, 'Trainer not found');
      }

      return trainer;
    } catch (error) {
      logger.error('Error updating trainer:', error);
      throw error;
    }
  }

  // Delete trainer
  async deleteTrainer(id) {
    try {
      const trainer = await Trainer.findByIdAndDelete(id);

      if (!trainer) {
        throw new ApiError(404, 'Trainer not found');
      }

      return { message: 'Trainer deleted successfully' };
    } catch (error) {
      logger.error('Error deleting trainer:', error);
      throw error;
    }
  }
}

module.exports = new TrainerService();
