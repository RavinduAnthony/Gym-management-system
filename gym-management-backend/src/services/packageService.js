const Package = require('../models/Package');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class PackageService {
  // Create new package
  async createPackage(packageData) {
    try {
      const pkg = await Package.create(packageData);
      return pkg;
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
      const where = {};

      // Filter by package type
      if (packageType) {
        where.packageType = packageType;
      }

      // Filter by active status
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const { count, rows: packages } = await Package.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']]
      });

      return {
        packages,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
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
      const pkg = await Package.findByPk(id);
      
      if (!pkg) {
        throw new ApiError(404, 'Package not found');
      }

      return pkg;
    } catch (error) {
      logger.error('Error getting package by ID:', error);
      throw error;
    }
  }

  // Update package
  async updatePackage(id, updateData) {
    try {
      const pkg = await Package.findByPk(id);

      if (!pkg) {
        throw new ApiError(404, 'Package not found');
      }

      await pkg.update(updateData);

      return pkg;
    } catch (error) {
      logger.error('Error updating package:', error);
      throw error;
    }
  }

  // Delete package
  async deletePackage(id) {
    try {
      const pkg = await Package.findByPk(id);

      if (!pkg) {
        throw new ApiError(404, 'Package not found');
      }

      await pkg.destroy();

      return { message: 'Package deleted successfully' };
    } catch (error) {
      logger.error('Error deleting package:', error);
      throw error;
    }
  }

  // Get active packages only
  async getActivePackages() {
    try {
      const packages = await Package.findAll({
        where: { isActive: true },
        order: [['price', 'ASC']]
      });

      return packages;
    } catch (error) {
      logger.error('Error getting active packages:', error);
      throw error;
    }
  }
}

module.exports = new PackageService();
