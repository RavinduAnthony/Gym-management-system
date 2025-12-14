const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const trainerRoutes = require('./trainerRoutes');
const expenseRoutes = require('./expenseRoutes');
const paymentRoutes = require('./paymentRoutes');
const packageRoutes = require('./packageRoutes');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiter to all API routes
router.use(apiLimiter);

// Route mounting
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trainers', trainerRoutes);
router.use('/expenses', expenseRoutes);
router.use('/payments', paymentRoutes);
router.use('/packages', packageRoutes);

module.exports = router;
