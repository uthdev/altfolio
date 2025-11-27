import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InvestmentService } from '../services/investmentService';

export class InvestmentController {
  static async getAllInvestments(req: AuthRequest, res: Response) {
    try {
      const investments = await InvestmentService.getAllInvestments();
      return res.json(investments);
    } catch (error) {
      console.error('Get investments error:', error);
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
      console.error('Get investment error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async createInvestment(req: AuthRequest, res: Response) {
    try {
      const investment = await InvestmentService.createInvestment(req.body);
      return res.status(201).json(investment);
    } catch (error) {
      console.error('Create investment error:', error);
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
      console.error('Update investment error:', error);
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
      console.error('Delete investment error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}