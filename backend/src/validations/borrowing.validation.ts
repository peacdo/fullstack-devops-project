import Joi from 'joi';

export const borrowingSchema = Joi.object({
  bookId: Joi.string().uuid().required(),
  dueDate: Joi.date().greater('now').required()
}); 