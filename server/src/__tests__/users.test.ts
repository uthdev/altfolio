import request from 'supertest';
import app from '../index';
import { User } from '../models/User';
import { UserService } from '../services/userService';
import jwt from 'jsonwebtoken';

const mockUser = User as jest.Mocked<typeof User>;

describe('User Endpoints', () => {
  let adminToken: string;
  let viewerToken: string;
  let invalidToken: string;
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
    invalidToken = 'invalid.token.here';
    
    User.findById = jest.fn().mockImplementation((id) => ({
      select: jest.fn().mockImplementation(() => {
        if (id === adminUser._id) return Promise.resolve(adminUser);
        if (id === viewerUser._id) return Promise.resolve(viewerUser);
        return Promise.resolve(null);
      })
    }));
  });

  describe('GET /api/users', () => {
    it('should return all users for authenticated user', async () => {
      const mockUsers = [
        { ...adminUser, _id: { toString: () => adminUser._id } },
        { ...viewerUser, _id: { toString: () => viewerUser._id } }
      ];
      User.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockUsers)
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.users[0]).toMatchObject({
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      });
    });

    it('should return empty array when no users exist', async () => {
      User.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(0);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(403);
    });

    it('should reject malformed authorization header', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    it('should handle database errors', async () => {
      User.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);
    });
  });

  describe('PUT /api/users/:id/role', () => {
    it('should allow admin to update user role to admin', async () => {
      const updatedUser = { 
        ...viewerUser, 
        role: 'admin',
        _id: { toString: () => viewerUser._id }
      };
      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser)
      });

      const response = await request(app)
        .put(`/api/users/${viewerUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.role).toBe('admin');
      expect(response.body.id).toBe(viewerUser._id);
    });

    it('should allow admin to update user role to viewer', async () => {
      const updatedUser = { 
        ...adminUser, 
        role: 'viewer',
        _id: { toString: () => adminUser._id }
      };
      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser)
      });

      const response = await request(app)
        .put(`/api/users/${adminUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'viewer' })
        .expect(200);

      expect(response.body.role).toBe('viewer');
    });

    it('should reject viewer from updating user role', async () => {
      await request(app)
        .put(`/api/users/${adminUser._id}/role`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ role: 'viewer' })
        .expect(403);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .put(`/api/users/${viewerUser._id}/role`)
        .send({ role: 'admin' })
        .expect(401);
    });

    it('should validate role field - invalid role', async () => {
      await request(app)
        .put(`/api/users/${viewerUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid' })
        .expect(400);
    });

    it('should validate role field - missing role', async () => {
      await request(app)
        .put(`/api/users/${viewerUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    it('should validate role field - null role', async () => {
      await request(app)
        .put(`/api/users/${viewerUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: null })
        .expect(400);
    });

    it('should return 404 for non-existent user', async () => {
      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await request(app)
        .put('/api/users/nonexistent123/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(404);
    });

    it('should handle database errors', async () => {
      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await request(app)
        .put(`/api/users/${viewerUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(500);
    });

    it('should handle invalid user ID format', async () => {
      await request(app)
        .put('/api/users/invalid-id/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(500);
    });
  });
});

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return formatted users list', async () => {
      const mockUsers = [
        { _id: { toString: () => 'user1' }, name: 'User 1', email: 'user1@test.com', role: 'admin' },
        { _id: { toString: () => 'user2' }, name: 'User 2', email: 'user2@test.com', role: 'viewer' }
      ];
      User.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockUsers)
      });

      const result = await UserService.getUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'user1',
        name: 'User 1',
        email: 'user1@test.com',
        role: 'admin'
      });
      expect(User.find).toHaveBeenCalledWith({}, '-passwordHash');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const mockUser = {
        _id: { toString: () => 'user123' },
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      };
      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await UserService.updateUserRole('user123', { role: 'admin' });

      expect(result).toEqual({
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { role: 'admin' },
        { new: true, runValidators: true }
      );
    });

    it('should throw error when user not found', async () => {
      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(UserService.updateUserRole('nonexistent', { role: 'admin' }))
        .rejects.toThrow('User not found');
    });
  });
});