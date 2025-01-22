import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../lib/db';
import { createTestUser, createTestBook } from '../utils/test-utils';
import { UserRole } from '../../types';

describe('Book Controller', () => {
  beforeEach(async () => {
    await prisma.borrowing.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('GET /api/books', () => {
    it('should return empty list when no books exist', async () => {
      const response = await request(app).get('/api/books');

      expect(response.status).toBe(200);
      expect(response.body.data.books).toEqual([]);
    });

    it('should return list of books', async () => {
      const book = await createTestBook();

      const response = await request(app).get('/api/books');

      expect(response.status).toBe(200);
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].id).toBe(book.id);
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return book details', async () => {
      const book = await createTestBook();

      const response = await request(app).get(`/api/books/${book.id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.book.id).toBe(book.id);
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app).get('/api/books/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Book not found');
    });
  });

  describe('POST /api/books', () => {
    const validBook = {
      title: 'New Book',
      author: 'Test Author',
      isbn: '1234567890123',
      category: 'Fiction',
      totalCopies: 2
    };

    it('should create book when admin', async () => {
      const { token } = await createTestUser(UserRole.ADMIN);

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send(validBook);

      expect(response.status).toBe(201);
      expect(response.body.data.book.title).toBe(validBook.title);
      expect(response.body.data.book.availableCopies).toBe(validBook.totalCopies);
    });

    it('should not allow non-admin to create book', async () => {
      const { token } = await createTestUser(UserRole.MEMBER);

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send(validBook);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should not create book with duplicate ISBN', async () => {
      const { token } = await createTestUser(UserRole.ADMIN);
      await createTestBook({ isbn: validBook.isbn });

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send(validBook);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Book with this ISBN already exists');
    });
  });

  describe('PUT /api/books/:id', () => {
    it('should update book when admin', async () => {
      const { token } = await createTestUser(UserRole.ADMIN);
      const book = await createTestBook();
      const updates = {
        title: 'Updated Title',
        totalCopies: 3
      };

      const response = await request(app)
        .put(`/api/books/${book.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.data.book.title).toBe(updates.title);
      expect(response.body.data.book.totalCopies).toBe(updates.totalCopies);
    });

    it('should not allow non-admin to update book', async () => {
      const { token } = await createTestUser(UserRole.MEMBER);
      const book = await createTestBook();

      const response = await request(app)
        .put(`/api/books/${book.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('should delete book when admin', async () => {
      const { token } = await createTestUser(UserRole.ADMIN);
      const book = await createTestBook();

      const response = await request(app)
        .delete(`/api/books/${book.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);

      const deletedBook = await prisma.book.findUnique({
        where: { id: book.id }
      });
      expect(deletedBook).toBeNull();
    });

    it('should not allow non-admin to delete book', async () => {
      const { token } = await createTestUser(UserRole.MEMBER);
      const book = await createTestBook();

      const response = await request(app)
        .delete(`/api/books/${book.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('should not delete book with active borrowings', async () => {
      const { token, user } = await createTestUser(UserRole.ADMIN);
      const book = await createTestBook();
      
      // Create an active borrowing
      await prisma.borrowing.create({
        data: {
          userId: user.id,
          bookId: book.id,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'BORROWED'
        }
      });

      const response = await request(app)
        .delete(`/api/books/${book.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Cannot delete book with active borrowings');
    });
  });
}); 