const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const User = require('../models/User');
const logger = require('../utils/logger');

class ReportService {
  async getRevenueReport(month, year) {
    try {
      const currentDate = new Date();
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();

      // Create date range for the month
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

      // Get payments for the month
      const payments = await Payment.find({
        paymentDate: { $gte: startDate, $lte: endDate }
      }).populate('userId', 'firstName lastName email');

      // Get expenses for the month
      const expenses = await Expense.find({
        date: { $gte: startDate, $lte: endDate }
      }).populate('userId', 'firstName lastName');

      // Calculate totals
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const netProfit = totalRevenue - totalExpenses;

      // Get payment breakdown by package type
      const paymentsByPackage = await Payment.aggregate([
        {
          $match: {
            paymentDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $group: {
            _id: '$user.packageType',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get expense breakdown by category
      const expensesByCategory = await Expense.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get member statistics
      const totalMembers = await User.countDocuments({ role: 'member' });
      const activeMembers = await User.countDocuments({ 
        role: 'member', 
        status: 'active' 
      });

      return {
        period: {
          month: targetMonth,
          year: targetYear,
          startDate,
          endDate
        },
        summary: {
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
        },
        payments: {
          total: totalRevenue,
          count: payments.length,
          byPackage: paymentsByPackage,
          details: payments
        },
        expenses: {
          total: totalExpenses,
          count: expenses.length,
          byCategory: expensesByCategory,
          details: expenses
        },
        members: {
          total: totalMembers,
          active: activeMembers,
          activePercentage: totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(2) : 0
        }
      };
    } catch (error) {
      logger.error('Error getting revenue report:', error);
      throw error;
    }
  }
}

module.exports = new ReportService();
