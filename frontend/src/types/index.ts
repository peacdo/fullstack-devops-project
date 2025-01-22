export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Borrowing {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'BORROWED' | 'RETURNED';
} 