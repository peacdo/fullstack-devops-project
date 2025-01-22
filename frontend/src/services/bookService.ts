import { apiClient } from '../api/client';
import { Book } from '../types';

export const bookService = {
  getBooks: async () => {
    const response = await apiClient.get<Book[]>('/books');
    return response.data;
  },

  getBook: async (id: string) => {
    const response = await apiClient.get<Book>(`/books/${id}`);
    return response.data;
  },

  createBook: async (book: Omit<Book, 'id' | 'availableCopies'>) => {
    const response = await apiClient.post<Book>('/books', book);
    return response.data;
  },

  updateBook: async (id: string, book: Partial<Book>) => {
    const response = await apiClient.put<Book>(`/books/${id}`, book);
    return response.data;
  },

  deleteBook: async (id: string) => {
    await apiClient.delete(`/books/${id}`);
  },
}; 