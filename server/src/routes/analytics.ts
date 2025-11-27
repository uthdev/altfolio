import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AnalyticsController } from '../controllers/analyticsController';

const router: Router = Router();

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get investment analytics summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary with totals, by-type breakdown, and timeline
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalInvestments:
 *                       type: number
 *                     totalInvested:
 *                       type: number
 *                     totalCurrentValue:
 *                       type: number
 *                     totalReturn:
 *                       type: number
 *                     returnPercentage:
 *                       type: number
 *                 byAssetType:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       count:
 *                         type: number
 *                       invested:
 *                         type: number
 *                       currentValue:
 *                         type: number
 *                 monthlyTimeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       invested:
 *                         type: number
 *                       count:
 *                         type: number
 */
router.get('/summary', authenticateToken, AnalyticsController.getSummary);

export default router;