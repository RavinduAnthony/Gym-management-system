const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPackageSchema, updatePackageSchema } = require('../validators/packageValidator');

// Public route for active packages
router.get('/active', packageController.getActivePackages);

// Get all packages (can be accessed by authenticated users)
router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);

// Protected routes (admin only)
router.post('/', auth, authorize('admin'), validate(createPackageSchema), packageController.createPackage);
router.put('/:id', auth, authorize('admin'), validate(updatePackageSchema), packageController.updatePackage);
router.delete('/:id', auth, authorize('admin'), packageController.deletePackage);

module.exports = router;
