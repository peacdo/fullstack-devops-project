import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create test user
  const testPassword = await bcrypt.hash('password123', 10);
  console.log('Creating test user...');
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: testPassword,
      role: 'MEMBER'
    }
  });

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  console.log('Creating admin user...');
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create sample books
  console.log('Creating sample books...');
  await prisma.book.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0743273565',
        category: 'Fiction',
        totalCopies: 5,
        availableCopies: 5,
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0451524935',
        category: 'Fiction',
        totalCopies: 3,
        availableCopies: 3,
      },
    ],
  });

  console.log('Database seeding completed');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 