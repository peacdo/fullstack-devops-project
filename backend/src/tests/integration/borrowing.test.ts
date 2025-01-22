import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';
import { createTestUser, createTestBook } from '../helpers';

const prisma = new PrismaClient();

describe('Borrowing Controller', () => {
  beforeEach(async () => {
    await prisma.borrowing.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/borrowings', () => {
    it('should create a new borrowing', async () => {
      const { user, token } = await createTestUser('MEMBER');
      const book = await createTestBook();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now

      const response = await request(app)
        .post('/api/borrowings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookId: book.id,
          dueDate: dueDate.toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body.data.borrowing.userId).toBe(user.id);
      expect(response.body.data.borrowing.bookId).toBe(book.id);
      expect(response.body.data.borrowing.status).toBe('BORROWED');
    });

    it('should not allow borrowing unavailable book', async () => {
      const { token } = await createTestUser('MEMBER');
      const book = await prisma.book.create({
        data: {
          title: 'Test Book',
          author: 'Test Author',
          isbn: '1234567890123',
          totalCopies: 1,
          availableCopies: 0
        }
      });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const response = await request(app)
        .post('/api/borrowings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookId: book.id,
          dueDate: dueDate.toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No copies available');
    });
  });

  describe('PUT /api/borrowings/:id/return', () => {
    it('should return a borrowed book', async () => {
      const { user, token } = await createTestUser('MEMBER');
      const book = await createTestBook();
      
      const borrowing = await prisma.borrowing.create({
        data: {
          userId: user.id,
          bookId: book.id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      });

      await prisma.book.update({
        where: { id: book.id },
        data: { availableCopies: 0 }
      });

      const response = await request(app)
        .put(`/api/borrowings/${borrowing.id}/return`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.borrowing.status).toBe('RETURNED');
      expect(response.body.data.borrowing.returnDate).toBeDefined();

      const updatedBook = await prisma.book.findUnique({
        where: { id: book.id }
      });
      expect(updatedBook?.availableCopies).toBe(1);
    });

    it('should not allow returning already returned book', async () => {
      const { user, token } = await createTestUser('MEMBER');
      const book = await createTestBook();
      
      const borrowing = await prisma.borrowing.create({
        data: {
          userId: user.id,
          bookId: book.id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'RETURNED',
          returnDate: new Date()
        }
      });

      const response = await request(app)
        .put(`/api/borrowings/${borrowing.id}/return`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Book already returned');
    });
  });

  describe('GET /api/borrowings', () => {
    it('should return user borrowings for member', async () => {
      const { user, token } = await createTestUser('MEMBER');
      const book = await createTestBook();
      
      await prisma.borrowing.create({
        data: {
          userId: user.id,
          bookId: book.id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      });

      const response = await request(app)
        .get('/api/borrowings')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.borrowings).toHaveLength(1);
      expect(response.body.data.borrowings[0].userId).toBe(user.id);
    });

    it('should return all borrowings for admin', async () => {
      const member = await createTestUser('MEMBER');
      const { token } = await createTestUser('ADMIN');
      const book = await createTestBook();
      
      await prisma.borrowing.create({
        data: {
          userId: member.user.id,
          bookId: book.id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      });

      const response = await request(app)
        .get('/api/borrowings')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.borrowings).toHaveLength(1);
    });
  });
}); 