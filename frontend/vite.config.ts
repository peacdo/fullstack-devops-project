import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/lib/',
  server: {
    port: 5173,
    proxy: {
      '/lib/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lib\/api/, '')
      }
    }
  }
}); 