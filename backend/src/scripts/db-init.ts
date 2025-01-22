import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

async function createAdminUser() {
  const adminPassword = await hashPassword('admin123');
  return prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: {
      email: 'admin@library.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });
}

async function createInitialBooks() {
  const books = [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273565',
      category: 'Fiction',
      totalCopies: 3,
      availableCopies: 3
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '9780451524935',
      category: 'Fiction',
      totalCopies: 5,
      availableCopies: 5
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      category: 'Technology',
      totalCopies: 2,
      availableCopies: 2
    }
  ];

  return Promise.all(
    books.map(book =>
      prisma.book.upsert({
        where: { isbn: book.isbn },
        update: {},
        create: book
      })
    )
  );
}

async function main() {
  try {
    logger.info('Starting database initialization...');

    await prisma.$connect();
    logger.info('Database connected');

    const admin = await createAdminUser();
    logger.info('Admin user created:', { userId: admin.id });

    const books = await createInitialBooks();
    logger.info('Initial books created:', { count: books.length });

    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      logger.error('Failed to initialize database:', error);
      process.exit(1);
    });
} 