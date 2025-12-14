const Payment = require('../models/Payment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class PaymentService {
  // Create new payment
  async createPayment(paymentData, addedById) {
    try {
      // Verify user exists
      const user = await User.findById(paymentData.userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const payment = await Payment.create({
        ...paymentData,
        addedBy: addedById
      });
      
      return await payment.populate([
        { path: 'userId', select: 'firstName lastName email packageType' },
        { path: 'addedBy', select: 'firstName lastName role' }
      ]);
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  // Get all payments with pagination and filtering
  async getAllPayments(options = {}) {
    const {
      page = 1,
      limit = 10,
      month,
      year,
      userId,
      status,
      paymentMethod
    } = options;

    try {
      const query = {};

      // Filter by month
      if (month) {
        query.paymentMonth = parseInt(month);
      }

      // Filter by year
      if (year) {
        query.paymentYear = parseInt(year);
      }

      // Filter by user
      if (userId) {
        query.userId = userId;
      }

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by payment method
      if (paymentMethod) {
        query.paymentMethod = paymentMethod;
      }

      const payments = await Payment.find(query)
        .populate('userId', 'firstName lastName email packageType mobileNumber')
        .populate('addedBy', 'firstName lastName role')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ paymentDate: -1 });

      const count = await Payment.countDocuments(query);

      // Calculate total revenue
      const totalRevenue = await Payment.aggregate([
        { $match: { ...query, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return {
        payments,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
        totalRevenue: totalRevenue[0]?.total || 0
      };
    } catch (error) {
      logger.error('Error getting payments:', error);
      throw error;
    }
  }

  // Get payment by ID
  async getPaymentById(id) {
    try {
      const payment = await Payment.findById(id)
        .populate('userId', 'firstName lastName email packageType mobileNumber')
        .populate('addedBy', 'firstName lastName role');
      
      if (!payment) {
        throw new ApiError(404, 'Payment not found');
      }

      return payment;
    } catch (error) {
      logger.error('Error getting payment by ID:', error);
      throw error;
    }
  }

  // Update payment
  async updatePayment(id, updateData) {
    try {
      const payment = await Payment.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate([
        { path: 'userId', select: 'firstName lastName email packageType' },
        { path: 'addedBy', select: 'firstName lastName role' }
      ]);

      if (!payment) {
        throw new ApiError(404, 'Payment not found');
      }

      return payment;
    } catch (error) {
      logger.error('Error updating payment:', error);
      throw error;
    }
  }

  // Delete payment
  async deletePayment(id) {
    try {
      const payment = await Payment.findByIdAndDelete(id);

      if (!payment) {
        throw new ApiError(404, 'Payment not found');
      }

      return { message: 'Payment deleted successfully' };
    } catch (error) {
      logger.error('Error deleting payment:', error);
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStats(month, year) {
    try {
      const query = {};
      
      if (month) query.paymentMonth = parseInt(month);
      if (year) query.paymentYear = parseInt(year);

      const stats = await Payment.aggregate([
        { $match: { ...query, status: 'paid' } },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const totalRevenue = await Payment.aggregate([
        { $match: { ...query, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const pendingPayments = await Payment.countDocuments({ ...query, status: 'pending' });
      const overduePayments = await Payment.countDocuments({ ...query, status: 'overdue' });

      return {
        byMethod: stats,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingCount: pendingPayments,
        overdueCount: overduePayments
      };
    } catch (error) {
      logger.error('Error getting payment stats:', error);
      throw error;
    }
  }

  // Get revenue calculation (payments - expenses)
  async getRevenueCalculation(month, year) {
    try {
      const Expense = require('../models/Expense');
      
      const query = {};
      if (month) {
        query.paymentMonth = parseInt(month);
        query.month = parseInt(month);
      }
      if (year) {
        query.paymentYear = parseInt(year);
        query.year = parseInt(year);
      }

      // Get total income (payments)
      const income = await Payment.aggregate([
        { $match: { paymentMonth: query.paymentMonth, paymentYear: query.paymentYear, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Get total expenses
      const expenses = await Expense.aggregate([
        { $match: { month: query.month, year: query.year } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const totalIncome = income[0]?.total || 0;
      const totalExpenses = expenses[0]?.total || 0;
      const revenue = totalIncome - totalExpenses;

      return {
        totalIncome,
        totalExpenses,
        revenue,
        month: query.paymentMonth,
        year: query.paymentYear
      };
    } catch (error) {
      logger.error('Error calculating revenue:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
