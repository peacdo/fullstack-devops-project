import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserRole } from '../types';
import { AppError } from './errorHandler';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      throw new AppError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: UserRole;
    };

    // Type assertion after verification
    (req as AuthRequest).user = {
      id: decoded.userId,
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    next(new AppError(401, 'Invalid token'));
  }
};

export const authorize = (roles: UserRole[]) => (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authReq = req as AuthRequest;
    if (!roles.includes(authReq.user.role)) {
      throw new AppError(403, 'Unauthorized');
    }
    next();
  } catch (error) {
    next(new AppError(403, 'Unauthorized'));
  }
}; 