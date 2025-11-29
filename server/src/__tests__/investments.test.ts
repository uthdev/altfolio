import request from 'supertest';
import app from '../index';
import { User } from '../models/User';
import { Investment } from '../models/Investment';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

describe('Investment Endpoints', () => {
  let adminToken: string;
  let viewerToken: string;
  let adminUser: any;
  let viewerUser: any;

  beforeEach(async () => {
    // Create test users
    const passwordHash = await bcrypt.hash('TestPass123!', 12);
    
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin'
    });

    viewerUser = await User.create({
      name: 'Viewer User',
      email: 'viewer@example.com',
      passwordHash,
      role: 'viewer'
    });

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    adminToken = jwt.sign({ userId: adminUser._id }, jwtSecret, { expiresIn: '1h' });
    viewerToken = jwt.sign({ userId: viewerUser._id }, jwtSecret, { expiresIn: '1h' });
  });

  describe('GET /api/investments', () => {
    it('should return investments for authenticated user', async () => {
      await Investment.create({
        assetName: 'Test Startup',
        assetType: 'Startup',
        investedAmount: 10000,
        investmentDate: new Date(),
        currentValue: 12000,
        owners: [adminUser._id]
      });

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
  });

  describe('POST /api/investments', () => {
    const investmentData = {
      assetName: 'New Startup',
      assetType: 'Startup',
      investedAmount: 15000,
      investmentDate: new Date().toISOString(),
      currentValue: 15000,
      owners: []
    };

    it('should allow admin to create investment', async () => {
      const response = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...investmentData, owners: [adminUser._id.toString()] })
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
        .send({ ...investmentData, owners: [viewerUser._id.toString()] })
        .expect(403);
    });

    it('should validate required fields', async () => {
      await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assetName: 'Incomplete' })
        .expect(400);
    });
  });

  describe('PUT /api/investments/:id', () => {
    let investment: any;

    beforeEach(async () => {
      investment = await Investment.create({
        assetName: 'Test Investment',
        assetType: 'Startup',
        investedAmount: 10000,
        investmentDate: new Date(),
        currentValue: 10000,
        owners: [adminUser._id]
      });
    });

    it('should allow admin to update investment', async () => {
      const updateData = { currentValue: 15000 };

      const response = await request(app)
        .put(`/api/investments/${investment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.currentValue).toBe(15000);
    });

    it('should reject viewer from updating investment', async () => {
      await request(app)
        .put(`/api/investments/${investment._id}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ currentValue: 15000 })
        .expect(403);
    });
  });

  describe('DELETE /api/investments/:id', () => {
    let investment: any;

    beforeEach(async () => {
      investment = await Investment.create({
        assetName: 'Test Investment',
        assetType: 'Startup',
        investedAmount: 10000,
        investmentDate: new Date(),
        currentValue: 10000,
        owners: [adminUser._id]
      });
    });

    it('should allow admin to delete investment', async () => {
      await request(app)
        .delete(`/api/investments/${investment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deletedInvestment = await Investment.findById(investment._id);
      expect(deletedInvestment).toBeNull();
    });

    it('should reject viewer from deleting investment', async () => {
      await request(app)
        .delete(`/api/investments/${investment._id}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });
  });
});