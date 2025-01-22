import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import type { RequestHandler } from 'express';
import {
  getBorrowings,
  getBorrowing,
  returnBorrowing,
  getUserBorrowings,
  borrowBook
} from '../controllers/borrowing.controller';
import { validate } from '../middleware/validate';
import { borrowingSchema } from '../validations/borrowing.validation';

const router = Router();

// All borrowing routes require authentication
router.use(authenticate);

router.get('/', getBorrowings as RequestHandler);
router.get('/my', getUserBorrowings as RequestHandler);
router.get('/:id', getBorrowing as RequestHandler);
router.post('/', validate(borrowingSchema), borrowBook as RequestHandler);
router.post('/:id/return', returnBorrowing as RequestHandler);

export default router; 