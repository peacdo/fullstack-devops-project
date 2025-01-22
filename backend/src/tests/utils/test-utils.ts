import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../types';

const prisma = new PrismaClient();

export async function createTestUser(
  role: UserRole = UserRole.MEMBER,
  overrides = {}
) {
  const defaultUser = {
    username: `test-user-${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    passwordHash: await bcrypt.hash('password123', 10),
    role,
  };

  const user = await prisma.user.create({
    data: {
      ...defaultUser,
      ...overrides,
    },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'test-secret'
  );

  return { user, token };
}

export async function createTestBook(overrides = {}) {
  const defaultBook = {
    title: `Test Book ${Date.now()}`,
    author: 'Test Author',
    isbn: `${Date.now()}`.padStart(13, '0'),
    totalCopies: 1,
    availableCopies: 1,
  };

  return prisma.book.create({
    data: {
      ...defaultBook,
      ...overrides,
    },
  });
}

export async function createTestBorrowing(
  userId: string,
  bookId: string,
  overrides = {}
) {
  const defaultBorrowing = {
    userId,
    bookId,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  };

  return prisma.borrowing.create({
    data: {
      ...defaultBorrowing,
      ...overrides,
    },
    include: {
      user: true,
      book: true,
    },
  });
} 