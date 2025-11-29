import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/userService';
import logger from '../utils/logger';

export class UserController {
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const users = await UserService.getUsers();
      return res.json({ users });
    } catch (error) {
      logger.error('Get users error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const result = await UserService.updateUserRole(req.params.id!, req.body);
      return res.json(result);
    } catch (error) {
      logger.error('Update user role error:', error);
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}