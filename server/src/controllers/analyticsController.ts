import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';

export class AnalyticsController {
  static async getSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await AnalyticsService.getSummary();
      return res.json(summary);
    } catch (error) {
      console.error('Analytics error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}