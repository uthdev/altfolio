import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { AuthResponse, ApiError } from '../types';
import logger from '../utils/logger';

export class AuthController {
  static async login(req: Request, res: Response<AuthResponse | ApiError>) {
    try {
      const result = await AuthService.login(req.body);
      return res.json(result);
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async register(req: Request, res: Response<AuthResponse | ApiError>) {
    try {
      const result = await AuthService.register(req.body);
      return res.status(201).json(result);
    } catch (error) {
      logger.error('Register error:', error);
      if (error instanceof Error && error.message === 'User already exists') {
        return res.status(409).json({ message: 'User already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const result = await AuthService.updateUserRole(req.params.id!, req.body);
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