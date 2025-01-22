import '@jest/globals';
import '@types/jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidResponse(): R;
    }
  }
} 