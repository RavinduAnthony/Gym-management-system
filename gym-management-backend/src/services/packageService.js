const Package = require('../models/Package');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class PackageService {
  // Create new package
  async createPackage(packageData) {
    try {
      const package = await Package.create(packageData);
      return package;
    } catch (error) {
      logger.error('Error creating package:', error);
      throw error;
    }
  }

  // Get all packages with pagination and filtering
  async getAllPackages(options = {}) {
    const {
      page = 1,
      limit = 10,
      packageType,
      isActive
    } = options;

    try {
      const query = {};

      // Filter by package type
      if (packageType) {
        query.packageType = packageType;
      }

      // Filter by active status
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const packages = await Package.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await Package.countDocuments(query);

      return {
        packages,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      };
    } catch (error) {
      logger.error('Error getting packages:', error);
      throw error;
    }
  }

  // Get package by ID
  async getPackageById(id) {
    try {
      const package = await Package.findById(id);
      
      if (!package) {
        throw new ApiError(404, 'Package not found');
      }

      return package;
    } catch (error) {
      logger.error('Error getting package by ID:', error);
      throw error;
    }
  }

  // Update package
  async updatePackage(id, updateData) {
    try {
      const package = await Package.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!package) {
        throw new ApiError(404, 'Package not found');
      }

      return package;
    } catch (error) {
      logger.error('Error updating package:', error);
      throw error;
    }
  }

  // Delete package
  async deletePackage(id) {
    try {
      const package = await Package.findByIdAndDelete(id);

      if (!package) {
        throw new ApiError(404, 'Package not found');
      }

      return { message: 'Package deleted successfully' };
    } catch (error) {
      logger.error('Error deleting package:', error);
      throw error;
    }
  }

  // Get active packages only
  async getActivePackages() {
    try {
      const packages = await Package.find({ isActive: true })
        .sort({ price: 1 });

      return packages;
    } catch (error) {
      logger.error('Error getting active packages:', error);
      throw error;
    }
  }
}

module.exports = new PackageService();
