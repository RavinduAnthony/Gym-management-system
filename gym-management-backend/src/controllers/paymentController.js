const paymentService = require('../services/paymentService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment created successfully
 */
exports.createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Payment created successfully',
    data: payment
  });
});

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of payments
 */
exports.getAllPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.getAllPayments(req.query);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 */
exports.getPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id);

  res.status(200).json({
    success: true,
    data: payment
  });
});

/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     summary: Update payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       200:
 *         description: Payment updated successfully
 */
exports.updatePayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.updatePayment(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Payment updated successfully',
    data: payment
  });
});

/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     summary: Delete payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment deleted successfully
 */
exports.deletePayment = asyncHandler(async (req, res) => {
  await paymentService.deletePayment(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Payment deleted successfully'
  });
});

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Get payment statistics
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment statistics
 */
exports.getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await paymentService.getPaymentStats(req.query.month, req.query.year);

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @swagger
 * /api/payments/revenue:
 *   get:
 *     summary: Get revenue calculation (income - expenses)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Revenue calculation
 */
exports.getRevenueCalculation = asyncHandler(async (req, res) => {
  const revenue = await paymentService.getRevenueCalculation(req.query.month, req.query.year);

  res.status(200).json({
    success: true,
    data: revenue
  });
});
