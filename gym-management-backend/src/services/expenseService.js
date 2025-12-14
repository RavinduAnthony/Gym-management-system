const Expense = require('../models/Expense');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class ExpenseService {
  // Create new expense
  async createExpense(expenseData, userId) {
    try {
      const expense = await Expense.create({
        ...expenseData,
        addedBy: userId
      });
      
      return await expense.populate('addedBy', 'firstName lastName role');
    } catch (error) {
      logger.error('Error creating expense:', error);
      throw error;
    }
  }

  // Get all expenses with pagination and filtering
  async getAllExpenses(options = {}) {
    const {
      page = 1,
      limit = 10,
      month,
      year,
      category,
      addedBy
    } = options;

    try {
      const query = {};

      // Filter by month
      if (month) {
        query.month = parseInt(month);
      }

      // Filter by year
      if (year) {
        query.year = parseInt(year);
      }

      // Filter by category
      if (category) {
        query.category = category;
      }

      // Filter by who added it
      if (addedBy) {
        query.addedBy = addedBy;
      }

      const expenses = await Expense.find(query)
        .populate('addedBy', 'firstName lastName role')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ date: -1 });

      const count = await Expense.countDocuments(query);

      // Calculate total expenses
      const totalExpenses = await Expense.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return {
        expenses,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
        totalAmount: totalExpenses[0]?.total || 0
      };
    } catch (error) {
      logger.error('Error getting expenses:', error);
      throw error;
    }
  }

  // Get expense by ID
  async getExpenseById(id) {
    try {
      const expense = await Expense.findById(id)
        .populate('addedBy', 'firstName lastName role');
      
      if (!expense) {
        throw new ApiError(404, 'Expense not found');
      }

      return expense;
    } catch (error) {
      logger.error('Error getting expense by ID:', error);
      throw error;
    }
  }

  // Update expense
  async updateExpense(id, updateData) {
    try {
      const expense = await Expense.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('addedBy', 'firstName lastName role');

      if (!expense) {
        throw new ApiError(404, 'Expense not found');
      }

      return expense;
    } catch (error) {
      logger.error('Error updating expense:', error);
      throw error;
    }
  }

  // Delete expense
  async deleteExpense(id) {
    try {
      const expense = await Expense.findByIdAndDelete(id);

      if (!expense) {
        throw new ApiError(404, 'Expense not found');
      }

      return { message: 'Expense deleted successfully' };
    } catch (error) {
      logger.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Get expense statistics
  async getExpenseStats(month, year) {
    try {
      const query = {};
      
      if (month) query.month = parseInt(month);
      if (year) query.year = parseInt(year);

      const stats = await Expense.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const totalExpenses = await Expense.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return {
        byCategory: stats,
        totalAmount: totalExpenses[0]?.total || 0
      };
    } catch (error) {
      logger.error('Error getting expense stats:', error);
      throw error;
    }
  }
}

module.exports = new ExpenseService();
