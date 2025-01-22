import { Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { prisma } from '../lib/db';

export const getBorrowings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';

    const borrowings = await prisma.borrowing.findMany({
      where: isAdmin ? undefined : { userId },
      include: {
        book: true,
        user: true
      }
    });

    res.json({ borrowings });
  } catch (error) {
    next(error);
  }
};

export const getBorrowing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';

    const borrowing = await prisma.borrowing.findUnique({
      where: { id },
      include: {
        book: true,
        user: true
      }
    });

    if (!borrowing) {
      throw new AppError(404, 'Borrowing not found');
    }

    if (!isAdmin && borrowing.userId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    res.json({ borrowing });
  } catch (error) {
    next(error);
  }
};

export const borrowBook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'User not authenticated');
    }

    const { bookId, dueDate } = req.body;

    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    if (book.availableCopies <= 0) {
      throw new AppError(400, 'No copies available for borrowing');
    }

    const borrowing = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const borrowing = await tx.borrowing.create({
        data: {
          user: { connect: { id: userId } },
          book: { connect: { id: bookId } },
          dueDate: new Date(dueDate)
        }
      });

      await tx.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } }
      });

      return borrowing;
    });

    res.status(201).json({ borrowing });
  } catch (error) {
    next(error);
  }
};

export const returnBorrowing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';

    const borrowing = await prisma.borrowing.findUnique({
      where: { id }
    });

    if (!borrowing) {
      throw new AppError(404, 'Borrowing not found');
    }

    if (!isAdmin && borrowing.userId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    if (borrowing.status === 'RETURNED') {
      throw new AppError(400, 'Book already returned');
    }

    const updatedBorrowing = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Increase available copies
      await tx.book.update({
        where: { id: borrowing.bookId },
        data: { availableCopies: { increment: 1 } }
      });

      // Update borrowing record
      return tx.borrowing.update({
        where: { id },
        data: {
          returnDate: new Date(),
          status: 'RETURNED'
        },
        include: {
          book: true,
          user: true
        }
      });
    });

    res.json({
      status: 'success',
      data: { borrowing: updatedBorrowing }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBorrowings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const borrowings = await prisma.borrowing.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        book: true,
      },
    });

    res.json({
      status: 'success',
      data: borrowings,
    });
  } catch (error) {
    next(error);
  }
}; 