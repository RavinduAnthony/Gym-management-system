const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(auth);
router.use(authorize('admin'));

// Revenue report
router.get('/revenue', reportController.getRevenueReport);

module.exports = router;
