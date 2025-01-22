import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

async function main() {
  try {
    // Run migrations
    logger.info('Running database migrations...');
    execSync('npx prisma migrate deploy');
    logger.info('Migrations completed successfully');

    // Generate Prisma Client
    logger.info('Generating Prisma Client...');
    execSync('npx prisma generate');
    logger.info('Prisma Client generated successfully');

    // Seed the database
    logger.info('Seeding database...');
    await prisma.$executeRaw`INSERT INTO "User" (id, email, username, password, role)
      VALUES (gen_random_uuid(), 'admin@example.com', 'admin', '$2a$10$K.0HwpsoPDGaB/atHBg.1OQY.NFNlNoX4Ea4mF9dFidPHXhVPoove', 'ADMIN')
      ON CONFLICT (email) DO NOTHING;`;
    logger.info('Database seeded successfully');

  } catch (error) {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 