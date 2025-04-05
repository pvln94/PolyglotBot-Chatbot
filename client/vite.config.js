// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Add this import

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      // Sync with tsconfig.json "paths"
      'types': path.resolve(__dirname, 'src/types'),
    },
  },
});