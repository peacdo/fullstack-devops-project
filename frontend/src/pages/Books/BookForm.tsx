import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { Book } from '../../types';

interface BookFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (book: Partial<Book>) => void;
  book?: Book;
}

export function BookForm({ open, onClose, onSubmit, book }: BookFormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const bookData = {
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      isbn: formData.get('isbn') as string,
      category: formData.get('category') as string,
      totalCopies: Number(formData.get('totalCopies')),
    };
    onSubmit(bookData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{book ? 'Edit Book' : 'Add New Book'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Title"
            name="title"
            defaultValue={book?.title}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="author"
            label="Author"
            name="author"
            defaultValue={book?.author}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="isbn"
            label="ISBN"
            name="isbn"
            defaultValue={book?.isbn}
          />
          <TextField
            margin="normal"
            fullWidth
            id="category"
            label="Category"
            name="category"
            defaultValue={book?.category}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="totalCopies"
            label="Total Copies"
            name="totalCopies"
            type="number"
            defaultValue={book?.totalCopies}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {book ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
} 