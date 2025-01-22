import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../lib/db';
import { createTestUser } from '../utils/test-utils';
import { UserRole } from '../../types';

describe('Auth Controller', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.username).toBe(validUser.username);
      expect(response.body.data.user.email).toBe(validUser.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should not register a user with existing email', async () => {
      await createTestUser(UserRole.MEMBER, {
        email: validUser.email,
        username: 'existinguser'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    beforeEach(async () => {
      await createTestUser(UserRole.MEMBER, {
        email: credentials.email,
        username: 'testuser'
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.token).toBeDefined();
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          ...credentials,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
}); 