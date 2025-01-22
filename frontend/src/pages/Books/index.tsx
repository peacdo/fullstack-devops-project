import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { BookList } from './BookList';
import { BookForm } from './BookForm';
import { bookService } from '../../services/bookService';
import { Book } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export function Books() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBook, setSelectedBook] = useState<Book | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: books, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: bookService.getBooks,
  });

  const createMutation = useMutation({
    mutationFn: bookService.createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, book }: { id: string; book: Partial<Book> }) =>
      bookService.updateBook(id, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setIsFormOpen(false);
      setSelectedBook(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bookService.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const handleAddBook = () => {
    setSelectedBook(undefined);
    setIsFormOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setIsFormOpen(true);
  };

  const handleSubmit = (bookData: Partial<Book>) => {
    if (selectedBook) {
      updateMutation.mutate({ id: selectedBook.id, book: bookData });
    } else {
      createMutation.mutate(bookData as Omit<Book, 'id' | 'availableCopies'>);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load books
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Books
        </Typography>
        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBook}
          >
            Add Book
          </Button>
        )}
      </Box>

      <BookList
        books={books || []}
        onEdit={handleEditBook}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <BookForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        book={selectedBook}
      />
    </Box>
  );
} 