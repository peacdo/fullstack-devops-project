import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { beforeAll, afterAll, beforeEach } from '@jest/globals';

const prisma = new PrismaClient();

// Suppress logs during tests
logger.silent = true;

beforeAll(async () => {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    process.exit(1);
  }
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.$transaction([
    prisma.borrowing.deleteMany(),
    prisma.book.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
}); 