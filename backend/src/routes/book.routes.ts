import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { bookSchema } from '../validations/book.validation';
import { UserRole } from '../types';
import type { RequestHandler } from 'express';
import {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook
} from '../controllers/book.controller';

const router = Router();

// Public routes
router.get('/', getBooks as RequestHandler);
router.get('/:id', getBook as RequestHandler);

// Protected routes
router.use(authenticate);

// Member routes
router.post('/:id/borrow', borrowBook as RequestHandler);
router.post('/:id/return', returnBook as RequestHandler);

// Admin routes
router.use(authorize([UserRole.ADMIN]));
router.post('/', validate(bookSchema), createBook as RequestHandler);
router.put('/:id', validate(bookSchema), updateBook as RequestHandler);
router.delete('/:id', deleteBook as RequestHandler);

export default router; 