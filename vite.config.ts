import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

export default defineConfig({
  plugins: [react()],
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    testTimeout: 10000, // Increase timeout to 10 seconds
    pool: 'forks', // Use forked processes instead of threads
    isolate: true, // Isolate tests in different environments
    reporter: 'verbose', // More detailed reporting
    onConsoleLog(log) {
      if (log.includes('Error:')) {
        console.error(log);
      }
      return false; // Prevent log from being swallowed
    }
  },

  // Add build configuration for Netlify
  build: {
    outDir: 'dist',  // Netlify expects dist folder
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});