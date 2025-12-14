const trainerService = require('../services/trainerService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/trainers:
 *   post:
 *     summary: Create a new trainer
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trainer'
 *     responses:
 *       201:
 *         description: Trainer created successfully
 */
exports.createTrainer = asyncHandler(async (req, res) => {
  const trainer = await trainerService.createTrainer(req.body);

  res.status(201).json({
    success: true,
    message: 'Trainer created successfully',
    data: trainer
  });
});

/**
 * @swagger
 * /api/trainers:
 *   get:
 *     summary: Get all trainers
 *     tags: [Trainers]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of trainers
 */
exports.getAllTrainers = asyncHandler(async (req, res) => {
  const result = await trainerService.getAllTrainers(req.query);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @swagger
 * /api/trainers/{id}:
 *   get:
 *     summary: Get trainer by ID
 *     tags: [Trainers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trainer details
 */
exports.getTrainerById = asyncHandler(async (req, res) => {
  const trainer = await trainerService.getTrainerById(req.params.id);

  res.status(200).json({
    success: true,
    data: trainer
  });
});

/**
 * @swagger
 * /api/trainers/{id}:
 *   put:
 *     summary: Update trainer
 *     tags: [Trainers]
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
 *             $ref: '#/components/schemas/Trainer'
 *     responses:
 *       200:
 *         description: Trainer updated successfully
 */
exports.updateTrainer = asyncHandler(async (req, res) => {
  const trainer = await trainerService.updateTrainer(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Trainer updated successfully',
    data: trainer
  });
});

/**
 * @swagger
 * /api/trainers/{id}:
 *   delete:
 *     summary: Delete trainer
 *     tags: [Trainers]
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
 *         description: Trainer deleted successfully
 */
exports.deleteTrainer = asyncHandler(async (req, res) => {
  await trainerService.deleteTrainer(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Trainer deleted successfully'
  });
});
