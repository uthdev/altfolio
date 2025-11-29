import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InvestmentService } from '../services/investmentService';
import logger from '../utils/logger';

export class InvestmentController {
  static async getAllInvestments(req: AuthRequest, res: Response) {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        assetType: req.query.assetType as string,
        owner: req.query.owner as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };
      
      const result = await InvestmentService.getAllInvestments(query);
      return res.json(result);
    } catch (error) {
      logger.error('Get investments error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getInvestmentById(req: AuthRequest, res: Response) {
    try {
      const investment = await InvestmentService.getInvestmentById(req.params.id!);
      
      if (!investment) {
        return res.status(404).json({ message: 'Investment not found' });
      }
      
      return res.json(investment);
    } catch (error) {
      logger.error('Get investment error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async createInvestment(req: AuthRequest, res: Response) {
    try {
      const investment = await InvestmentService.createInvestment(req.body);
      return res.status(201).json(investment);
    } catch (error) {
      logger.error('Create investment error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateInvestment(req: AuthRequest, res: Response) {
    try {
      const investment = await InvestmentService.updateInvestment(req.params.id!, req.body);

      if (!investment) {
        return res.status(404).json({ message: 'Investment not found' });
      }

      return res.json(investment);
    } catch (error) {
      logger.error('Update investment error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteInvestment(req: AuthRequest, res: Response) {
    try {
      const investment = await InvestmentService.deleteInvestment(req.params.id!);
      
      if (!investment) {
        return res.status(404).json({ message: 'Investment not found' });
      }
      
      return res.json({ message: 'Investment deleted successfully' });
    } catch (error) {
      logger.error('Delete investment error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}