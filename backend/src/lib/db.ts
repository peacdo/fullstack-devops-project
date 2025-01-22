import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function initializeDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connection established');

    // Try to query the database to verify the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database query successful');

  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Failed to disconnect database:', error);
    throw error;
  }
} 