const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTrainerSchema, updateTrainerSchema } = require('../validators/trainerValidator');

// Public routes
router.get('/', trainerController.getAllTrainers);
router.get('/:id', trainerController.getTrainerById);

// Protected routes (admin only)
router.post('/', auth, authorize('admin'), validate(createTrainerSchema), trainerController.createTrainer);
router.put('/:id', auth, authorize('admin'), validate(updateTrainerSchema), trainerController.updateTrainer);
router.delete('/:id', auth, authorize('admin'), trainerController.deleteTrainer);

module.exports = router;
