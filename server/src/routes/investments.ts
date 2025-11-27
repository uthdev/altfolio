import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { CreateInvestmentSchema, UpdateInvestmentSchema } from '../types';
import { InvestmentController } from '../controllers/investmentController';

const router: Router = Router();

/**
 * @swagger
 * /investments:
 *   get:
 *     summary: Get all investments
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of investments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Investment'
 */
router.get('/', authenticateToken, InvestmentController.getAllInvestments);

/**
 * @swagger
 * /investments/{id}:
 *   get:
 *     summary: Get investment by ID
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Investment ID
 *     responses:
 *       200:
 *         description: Investment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Investment'
 *       404:
 *         description: Investment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:id', authenticateToken, InvestmentController.getInvestmentById);

/**
 * @swagger
 * /investments:
 *   post:
 *     summary: Create investment (admin only)
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvestmentRequest'
 *     responses:
 *       201:
 *         description: Investment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Investment'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  validateBody(CreateInvestmentSchema),
  InvestmentController.createInvestment
);

/**
 * @swagger
 * /investments/{id}:
 *   put:
 *     summary: Update investment (admin only)
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Investment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvestmentRequest'
 *     responses:
 *       200:
 *         description: Investment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Investment'
 *       404:
 *         description: Investment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  validateBody(UpdateInvestmentSchema),
  InvestmentController.updateInvestment
);

/**
 * @swagger
 * /investments/{id}:
 *   delete:
 *     summary: Delete investment (admin only)
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Investment ID
 *     responses:
 *       200:
 *         description: Investment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Investment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.delete('/:id', 
  authenticateToken, 
  requireAdmin, 
  InvestmentController.deleteInvestment
);

export default router;