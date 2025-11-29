import request from 'supertest';
import app from '../index';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

// Mock User model
const mockUser = User as jest.Mocked<typeof User>;

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'TestPass123!',
        role: 'viewer'
      };

      const mockCreatedUser = {
        _id: { toString: () => 'user123' },
        name: userData.name,
        email: userData.email,
        role: userData.role,
        passwordHash: 'hashedpassword',
        save: jest.fn().mockResolvedValue(true)
      };

      mockUser.findOne = jest.fn().mockResolvedValue(null);
      (User as any).mockImplementation(() => mockCreatedUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
    });

    it('should reject weak passwords', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        role: 'viewer'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should reject duplicate emails', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'TestPass123!',
        role: 'viewer'
      };

      mockUser.findOne = jest.fn().mockResolvedValue({ email: userData.email });

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const password = 'TestPass123!';
      const passwordHash = await bcrypt.hash(password, 12);
      
      const mockUserData = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash,
        role: 'viewer'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUserData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('john@example.com');
    });

    it('should reject invalid credentials', async () => {
      const passwordHash = await bcrypt.hash('TestPass123!', 12);
      
      const mockUserData = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash,
        role: 'viewer'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUserData);

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPass123!'
        })
        .expect(401);
    });
  });
});