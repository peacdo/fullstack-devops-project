import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, BookRequestBody } from '../types';

export const getBooks = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const books = await prisma.book.findMany();
    res.json({ status: 'success', data: books });
  } catch (error) {
    next(error);
  }
};

export const getBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id }
    });
    
    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    res.json({ status: 'success', data: book });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, author, isbn, category, totalCopies } = req.body as BookRequestBody;

    const existingBook = await prisma.book.findUnique({
      where: { isbn }
    });

    if (existingBook) {
      throw new AppError(400, 'Book with this ISBN already exists');
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        category,
        totalCopies,
        availableCopies: totalCopies
      }
    });

    res.status(201).json({
      status: 'success',
      data: { book }
    });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, author, isbn, category, totalCopies } = req.body as BookRequestBody;

    const existingBook = await prisma.book.findUnique({
      where: { id }
    });

    if (!existingBook) {
      throw new AppError(404, 'Book not found');
    }

    // Calculate new available copies
    const borrowedCopies = existingBook.totalCopies - existingBook.availableCopies;
    const newAvailableCopies = Math.max(totalCopies - borrowedCopies, 0);

    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        isbn,
        category,
        totalCopies,
        availableCopies: newAvailableCopies
      }
    });

    res.json({
      status: 'success',
      data: { book }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        borrowings: {
          where: { status: 'BORROWED' }
        }
      }
    });

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    if (book.borrowings.length > 0) {
      throw new AppError(400, 'Cannot delete book with active borrowings');
    }

    await prisma.book.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const borrowBook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id }
    });

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    if (book.availableCopies === 0) {
      throw new AppError(400, 'No copies available');
    }

    const borrowing = await prisma.$transaction([
      prisma.book.update({
        where: { id: book.id },
        data: { availableCopies: book.availableCopies - 1 }
      }),
      prisma.borrowing.create({
        data: {
          bookId: book.id,
          userId: req.user.userId,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    res.json({ status: 'success', data: borrowing });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const borrowing = await prisma.borrowing.findFirst({
      where: {
        bookId: req.params.id,
        userId: req.user.userId,
        status: 'BORROWED'
      }
    });

    if (!borrowing) {
      throw new AppError(404, 'Active borrowing not found');
    }

    const [updatedBook, updatedBorrowing] = await prisma.$transaction([
      prisma.book.update({
        where: { id: req.params.id },
        data: {
          availableCopies: {
            increment: 1
          }
        }
      }),
      prisma.borrowing.update({
        where: { id: borrowing.id },
        data: {
          returnDate: new Date(),
          status: 'RETURNED'
        }
      })
    ]);

    res.json({
      status: 'success',
      data: {
        book: updatedBook,
        borrowing: updatedBorrowing
      }
    });
  } catch (error) {
    next(error);
  }
}; 