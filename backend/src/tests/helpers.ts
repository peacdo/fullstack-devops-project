import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createTestUser = async (role: 'ADMIN' | 'MEMBER' = 'MEMBER') => {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      username: `test-user-${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      passwordHash,
      role
    }
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'test-secret'
  );

  return { user, token };
};

export const createTestBook = async () => {
  return prisma.book.create({
    data: {
      title: `Test Book ${Date.now()}`,
      author: 'Test Author',
      isbn: `${Date.now()}`.padStart(13, '0'),
      totalCopies: 1,
      availableCopies: 1
    }
  });
}; 