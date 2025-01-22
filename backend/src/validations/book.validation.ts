import Joi from 'joi';
import { BookRequestBody } from '../types';

export const bookSchema = Joi.object<BookRequestBody>({
  title: Joi.string().required(),
  author: Joi.string().required(),
  isbn: Joi.string().required(),
  category: Joi.string().optional(),
  totalCopies: Joi.number().integer().min(1).required()
}); 