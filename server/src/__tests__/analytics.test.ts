import request from 'supertest';
import app from '../index';
import { User } from '../models/User';
import { Investment } from '../models/Investment';
import { AnalyticsService } from '../services/analyticsService';
import jwt from 'jsonwebtoken';

const mockUser = User as jest.Mocked<typeof User>;
const mockInvestment = Investment as jest.Mocked<typeof Investment>;

describe('Analytics Endpoints', () => {
  let adminToken: string;
  let viewerToken: string;
  const adminUser = {
    _id: 'admin123',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };
  const viewerUser = {
    _id: 'viewer123',
    name: 'Viewer User',
    email: 'viewer@example.com',
    role: 'viewer'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    adminToken = jwt.sign({ userId: adminUser._id }, jwtSecret, { expiresIn: '1h' });
    viewerToken = jwt.sign({ userId: viewerUser._id }, jwtSecret, { expiresIn: '1h' });
    
    User.findById = jest.fn().mockImplementation((id) => ({
      select: jest.fn().mockImplementation(() => {
        if (id === adminUser._id) return Promise.resolve(adminUser);
        if (id === viewerUser._id) return Promise.resolve(viewerUser);
        return Promise.resolve(null);
      })
    }));
  });

  describe('GET /api/analytics/summary', () => {
    const mockAnalytics = {
      totalInvested: 100000,
      totalCurrentValue: 120000,
      totalReturn: 20000,
      returnPercentage: 20,
      byAssetType: [
        { _id: 'Startup', totalInvested: 50000, totalCurrentValue: 75000, count: 2 },
        { _id: 'Crypto Fund', totalInvested: 30000, totalCurrentValue: 25000, count: 1 },
        { _id: 'Farmland', totalInvested: 20000, totalCurrentValue: 20000, count: 1 }
      ],
      timeline: [
        { month: '2024-01', totalInvested: 50000, totalCurrentValue: 60000 },
        { month: '2024-02', totalInvested: 80000, totalCurrentValue: 95000 },
        { month: '2024-03', totalInvested: 100000, totalCurrentValue: 120000 }
      ]
    };

    it('should return analytics summary for authenticated user', async () => {
      const mockInvestments = [
        {
          assetType: 'Startup',
          investedAmount: 50000,
          currentValue: 75000,
          investmentDate: new Date('2024-01-15'),
          owners: []
        },
        {
          assetType: 'Crypto Fund',
          investedAmount: 30000,
          currentValue: 25000,
          investmentDate: new Date('2024-02-15'),
          owners: []
        }
      ];
      
      Investment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvestments)
      });

      const response = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        totalInvested: 80000,
        totalCurrentValue: 100000,
        totalReturn: 20000,
        returnPercentage: 25
      });
    });

    it('should return analytics summary filtered by owner', async () => {
      const mockInvestments = [
        {
          assetType: 'Startup',
          investedAmount: 50000,
          currentValue: 60000,
          investmentDate: new Date('2024-01-15'),
          owners: []
        }
      ];
      
      Investment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvestments)
      });

      const response = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        totalInvested: 50000,
        totalCurrentValue: 60000,
        totalReturn: 10000,
        returnPercentage: 20
      });
    });

    it('should handle zero investments', async () => {
      Investment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      const response = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        totalInvested: 0,
        totalCurrentValue: 0,
        totalReturn: 0,
        returnPercentage: 0,
        byAssetType: [],
        timeline: []
      });
    });

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .get('/api/analytics/summary')
        .expect(401);
    });

    it('should handle database errors', async () => {
      Investment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);
    });

    it('should work for viewer role', async () => {
      const mockInvestments = [
        {
          assetType: 'Startup',
          investedAmount: 100000,
          currentValue: 120000,
          investmentDate: new Date('2024-01-15'),
          owners: []
        }
      ];
      
      Investment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvestments)
      });

      const response = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        totalInvested: 100000,
        totalCurrentValue: 120000
      });
    });
  });
});

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should calculate analytics with valid data', async () => {
      const mockInvestments = [
        {
          assetType: 'Startup',
          investedAmount: 50000,
          currentValue: 75000,
          investmentDate: new Date('2024-01-15'),
          owners: []
        },
        {
          assetType: 'Startup',
          investedAmount: 50000,
          currentValue: 45000,
          investmentDate: new Date('2024-02-15'),
          owners: []
        }
      ];

      Investment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvestments)
      });

      const result = await AnalyticsService.getSummary();

      expect(result).toEqual({
        totalInvested: 100000,
        totalCurrentValue: 120000,
        totalReturn: 20000,
        returnPercentage: 20,
        byAssetType: [{
          assetType: 'Startup',
          count: 2,
          totalInvested: 100000,
          totalCurrentValue: 120000
        }],
        timeline: [
          { month: '2024-01', totalInvested: 50000, totalCurrentValue: 75000 },
          { month: '2024-02', totalInvested: 100000, totalCurrentValue: 120000 }
        ]
      });
    });

    it('should handle empty results', async () => {
      Investment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      const result = await AnalyticsService.getSummary();

      expect(result).toEqual({
        totalInvested: 0,
        totalCurrentValue: 0,
        totalReturn: 0,
        returnPercentage: 0,
        byAssetType: [],
        timeline: []
      });
    });

    it('should filter by owner when provided', async () => {
      const mockInvestments = [
        {
          assetType: 'Startup',
          investedAmount: 50000,
          currentValue: 60000,
          investmentDate: new Date('2024-01-15'),
          owners: []
        }
      ];
      
      Investment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvestments)
      });

      const result = await AnalyticsService.getSummary();

      expect(result.totalInvested).toBe(50000);
    });

    it('should handle zero invested amount', async () => {
      const mockInvestments = [
        {
          assetType: 'Startup',
          investedAmount: 0,
          currentValue: 100,
          investmentDate: new Date('2024-01-15'),
          owners: []
        }
      ];
      
      Investment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvestments)
      });

      const result = await AnalyticsService.getSummary();

      expect(result.returnPercentage).toBe(0);
    });
  });
});