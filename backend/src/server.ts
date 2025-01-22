import app from './app';
import { logger } from './utils/logger';
import { initializeDatabase } from './lib/db';

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 