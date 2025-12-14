const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateUserSchema } = require('../validators/userValidator');

// All routes require authentication
router.use(auth);

// Get user statistics (admin only)
router.get('/stats', authorize('admin'), userController.getUserStats);

// Coach-related routes
router.get('/coaches', userController.getAllCoaches);
router.get('/coach/:coachId/clients', userController.getCoachClients);
router.put('/:clientId/assign-coach', authorize('admin'), userController.assignCoachToClient);

// CRUD operations
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
