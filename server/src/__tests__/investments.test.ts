import request from 'supertest';
import app from '../index';
import { User } from '../models/User';
import { Investment } from '../models/Investment';
import { InvestmentService } from '../services/investmentService';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock models
const mockUser = User as jest.Mocked<typeof User>;
const mockInvestment = Investment as jest.Mocked<typeof Investment>;

describe('Investment Endpoints', () => {
  let adminToken: string;
  let viewerToken: string;
  const adminUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };
  const viewerUser = {
    _id: '507f1f77bcf86cd799439012',
    name: 'Viewer User',
    email: 'viewer@example.com',
    role: 'viewer'
  };

  beforeEach(() => {
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    adminToken = jwt.sign({ userId: adminUser._id }, jwtSecret, { expiresIn: '1h' });
    viewerToken = jwt.sign({ userId: viewerUser._id }, jwtSecret, { expiresIn: '1h' });
    
    // Mock User.findById for auth middleware
    User.findById = jest.fn().mockImplementation((id) => ({
      select: jest.fn().mockImplementation(() => {
        if (id === adminUser._id) return Promise.resolve(adminUser);
        if (id === viewerUser._id) return Promise.resolve(viewerUser);
        return Promise.resolve(null);
      })
    }));
  });

  describe('GET /api/investments', () => {
    it('should return investments for authenticated user', async () => {
      const mockInvestments = [{
        _id: 'inv123',
        assetName: 'Test Startup',
        assetType: 'Startup',
        investedAmount: 10000,
        currentValue: 12000,
        owners: [adminUser._id]
      }];

      mockInvestment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockInvestments)
            })
          })
        })
      });
      mockInvestment.countDocuments = jest.fn().mockResolvedValue(1);

      const response = await request(app)
        .get('/api/investments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.investments).toHaveLength(1);
      expect(response.body.investments[0]).toMatchObject({
        assetName: 'Test Startup',
        assetType: 'Startup'
      });
    });

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .get('/api/investments')
        .expect(401);
    });

    it('should handle database errors', async () => {
      mockInvestment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockRejectedValue(new Error('Database error'))
            })
          })
        })
      });

      await request(app)
        .get('/api/investments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);
    });
  });

  describe('GET /api/investments/:id', () => {
    const investmentId = 'inv123';

    it('should return investment by ID for authenticated user', async () => {
      const mockInvestment = {
        _id: investmentId,
        assetName: 'Test Investment',
        assetType: 'Startup',
        investedAmount: 10000,
        currentValue: 12000,
        owners: [adminUser._id]
      };

      Investment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvestment)
      });

      const response = await request(app)
        .get(`/api/investments/${investmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        assetName: 'Test Investment',
        assetType: 'Startup'
      });
    });

    it('should return 404 for non-existent investment', async () => {
      Investment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await request(app)
        .get('/api/investments/nonexistent123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .get(`/api/investments/${investmentId}`)
        .expect(401);
    });

    it('should handle database errors', async () => {
      Investment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await request(app)
        .get(`/api/investments/${investmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);
    });
  });

  describe('POST /api/investments', () => {
    const investmentData = {
      assetName: 'New Startup',
      assetType: 'Startup' as const,
      investedAmount: 15000,
      investmentDate: new Date().toISOString(),
      currentValue: 15000,
      owners: [adminUser._id]
    };

    it('should allow admin to create investment', async () => {
      const mockCreatedInvestment = {
        _id: 'inv456',
        ...investmentData,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: 'inv456',
          ...investmentData
        })
      };

      (Investment as any).mockImplementation(() => mockCreatedInvestment);

      const response = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(investmentData)
        .expect(201);

      expect(response.body).toMatchObject({
        assetName: investmentData.assetName,
        assetType: investmentData.assetType
      });
    });

    it('should reject viewer from creating investment', async () => {
      await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(investmentData)
        .expect(403);
    });

    it('should validate required fields', async () => {
      await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assetName: 'Incomplete' })
        .expect(400);
    });

    it('should handle database errors during creation', async () => {
      (Investment as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(investmentData)
        .expect(500);
    });
  });

  describe('PUT /api/investments/:id', () => {
    const investmentId = 'inv123';

    it('should allow admin to update investment', async () => {
      const updateData = { currentValue: 15000 };
      const mockUpdatedInvestment = {
        _id: investmentId,
        assetName: 'Test Investment',
        currentValue: 15000,
        populate: jest.fn().mockResolvedValue({
          _id: investmentId,
          currentValue: 15000
        })
      };

      mockInvestment.findByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUpdatedInvestment)
      });

      const response = await request(app)
        .put(`/api/investments/${investmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.currentValue).toBe(15000);
    });

    it('should reject viewer from updating investment', async () => {
      await request(app)
        .put(`/api/investments/${investmentId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ currentValue: 15000 })
        .expect(403);
    });

    it('should return 404 for non-existent investment', async () => {
      mockInvestment.findByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await request(app)
        .put('/api/investments/nonexistent123')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentValue: 15000 })
        .expect(404);
    });

    it('should handle database errors during update', async () => {
      mockInvestment.findByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await request(app)
        .put(`/api/investments/${investmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentValue: 15000 })
        .expect(500);
    });
  });

  describe('DELETE /api/investments/:id', () => {
    const investmentId = 'inv123';

    it('should allow admin to delete investment', async () => {
      mockInvestment.findByIdAndDelete = jest.fn().mockResolvedValue({
        _id: investmentId,
        assetName: 'Test Investment'
      });

      await request(app)
        .delete(`/api/investments/${investmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should reject viewer from deleting investment', async () => {
      await request(app)
        .delete(`/api/investments/${investmentId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent investment', async () => {
      mockInvestment.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await request(app)
        .delete('/api/investments/nonexistent123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should handle database errors during deletion', async () => {
      mockInvestment.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

      await request(app)
        .delete(`/api/investments/${investmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);
    });
  });
});

describe('InvestmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInvestmentById', () => {
    it('should return investment when found', async () => {
      const mockInvestment = {
        _id: 'inv123',
        assetName: 'Test Investment',
        assetType: 'Startup'
      };
      Investment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvestment)
      });

      const result = await InvestmentService.getInvestmentById('inv123');
      expect(result).toEqual(mockInvestment);
      expect(Investment.findById).toHaveBeenCalledWith('inv123');
    });

    it('should return null when investment not found', async () => {
      Investment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const result = await InvestmentService.getInvestmentById('nonexistent');
      expect(result).toBeNull();
    });
  });
});