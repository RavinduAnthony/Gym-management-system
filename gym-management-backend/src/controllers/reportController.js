const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/reportService');

/**
 * @swagger
 * /api/reports/revenue:
 *   get:
 *     summary: Get revenue report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: number
 *         description: Month (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Year
 *     responses:
 *       200:
 *         description: Revenue report data
 */
exports.getRevenueReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const report = await reportService.getRevenueReport(month, year);

  res.status(200).json({
    success: true,
    data: report
  });
});
