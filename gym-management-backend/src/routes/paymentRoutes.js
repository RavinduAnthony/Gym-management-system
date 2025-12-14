const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPaymentSchema, updatePaymentSchema } = require('../validators/paymentValidator');

// All routes require authentication
router.use(auth);

// Get payment statistics and revenue
router.get('/stats', paymentController.getPaymentStats);
router.get('/revenue', paymentController.getRevenueCalculation);

// CRUD operations
router.post('/', validate(createPaymentSchema), paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', validate(updatePaymentSchema), paymentController.updatePayment);
router.delete('/:id', authorize('admin'), paymentController.deletePayment);

module.exports = router;
