import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6)
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
});

export const bookSchema = Joi.object({
  title: Joi.string().required().max(100),
  author: Joi.string().required(),
  isbn: Joi.string().required().length(13),
  category: Joi.string(),
  totalCopies: Joi.number().integer().min(1)
});

export const borrowingSchema = Joi.object({
  bookId: Joi.string().required(),
  dueDate: Joi.date().greater('now').required()
}); 