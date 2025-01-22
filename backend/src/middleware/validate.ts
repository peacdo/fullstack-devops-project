import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from './errorHandler';

export const validate = (schema: Schema) => (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      throw new AppError(400, message);
    }
    next();
  } catch (error) {
    next(error);
  }
}; 