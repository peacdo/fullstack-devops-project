import { Typography, Container } from '@mui/material';

export function Home() {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Library Management System
      </Typography>
      <Typography paragraph>
        This is a simple library management system where you can browse and borrow books.
      </Typography>
    </Container>
  );
} 