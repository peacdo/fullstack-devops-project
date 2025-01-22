import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Typography
} from '@mui/material';
import { api } from '../contexts/AuthContext';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
}

export function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/books')
      .then(response => {
        setBooks(response.data.data);
      })
      .catch(error => {
        setError('Failed to load books');
        console.error('Error loading books:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleBorrow = async (bookId: string) => {
    try {
      setError(''); // Clear any previous errors
      await api.post(`/books/${bookId}/borrow`);
      // Refresh book list
      const response = await api.get('/books');
      setBooks(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error borrowing book');
      console.error('Error borrowing book:', error);
    }
  };

  if (loading) {
    return <Typography>Loading books...</Typography>;
  }

  if (error) {
    return (
      <>
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>ISBN</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.isbn}</TableCell>
                  <TableCell>{book.category}</TableCell>
                  <TableCell>{book.availableCopies}/{book.totalCopies}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      disabled={book.availableCopies === 0}
                      onClick={() => handleBorrow(book.id)}
                    >
                      Borrow
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>ISBN</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Available</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.isbn}</TableCell>
              <TableCell>{book.category}</TableCell>
              <TableCell>{book.availableCopies}/{book.totalCopies}</TableCell>
              <TableCell>
                <Button 
                  variant="contained" 
                  disabled={book.availableCopies === 0}
                  onClick={() => handleBorrow(book.id)}
                >
                  Borrow
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 