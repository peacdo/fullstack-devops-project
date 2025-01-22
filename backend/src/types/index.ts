import type { Request, Response, NextFunction } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category?: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user: {
    id: string;
    userId: string;
    role: UserRole;
  };
}

export type RequestWithAuth<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> = Request<P, ResBody, ReqBody, ReqQuery> & AuthRequest;

export type AuthHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> = (
  req: RequestWithAuth<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void> | void;

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface BookRequestBody {
  title: string;
  author: string;
  isbn: string;
  category?: string;
  totalCopies: number;
}

export enum Status {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED'
}

export interface BorrowingRequestBody {
  bookId: string;
}

export interface Borrowing {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: Status;
  book: Book;
  user: User;
} 