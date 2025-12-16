const packageService = require('../services/packageService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/packages:
 *   post:
 *     summary: Create a new package
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Package'
 *     responses:
 *       201:
 *         description: Package created successfully
 */
exports.createPackage = asyncHandler(async (req, res) => {
  const pkg = await packageService.createPackage(req.body);

  res.status(201).json({
    success: true,
    message: 'Package created successfully',
    data: pkg
  });
});

/**
 * @swagger
 * /api/packages:
 *   get:
 *     summary: Get all packages
 *     tags: [Packages]
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
 *         name: packageType
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of packages
 */
exports.getAllPackages = asyncHandler(async (req, res) => {
  const result = await packageService.getAllPackages(req.query);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @swagger
 * /api/packages/active:
 *   get:
 *     summary: Get active packages only
 *     tags: [Packages]
 *     responses:
 *       200:
 *         description: List of active packages
 */
exports.getActivePackages = asyncHandler(async (req, res) => {
  const packages = await packageService.getActivePackages();

  res.status(200).json({
    success: true,
    data: packages
  });
});

/**
 * @swagger
 * /api/packages/{id}:
 *   get:
 *     summary: Get package by ID
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package details
 */
exports.getPackageById = asyncHandler(async (req, res) => {
  const pkg = await packageService.getPackageById(req.params.id);

  res.status(200).json({
    success: true,
    data: pkg
  });
});

/**
 * @swagger
 * /api/packages/{id}:
 *   put:
 *     summary: Update package
 *     tags: [Packages]
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
 *             $ref: '#/components/schemas/Package'
 *     responses:
 *       200:
 *         description: Package updated successfully
 */
exports.updatePackage = asyncHandler(async (req, res) => {
  const pkg = await packageService.updatePackage(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Package updated successfully',
    data: pkg
  });
});

/**
 * @swagger
 * /api/packages/{id}:
 *   delete:
 *     summary: Delete package
 *     tags: [Packages]
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
 *         description: Package deleted successfully
 */
exports.deletePackage = asyncHandler(async (req, res) => {
  await packageService.deletePackage(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Package deleted successfully'
  });
});
