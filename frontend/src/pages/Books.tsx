import { Container, Typography } from '@mui/material';
import { BookList } from '../components/BookList';

export function Books() {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Books
      </Typography>
      <BookList />
    </Container>
  );
} 