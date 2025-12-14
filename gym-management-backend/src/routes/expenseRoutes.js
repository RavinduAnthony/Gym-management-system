const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createExpenseSchema, updateExpenseSchema } = require('../validators/expenseValidator');

// All routes require authentication
router.use(auth);

// Get expense statistics
router.get('/stats', expenseController.getExpenseStats);

// CRUD operations
router.post('/', validate(createExpenseSchema), expenseController.createExpense);
router.get('/', expenseController.getAllExpenses);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', validate(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:id', authorize('admin'), expenseController.deleteExpense);

module.exports = router;
