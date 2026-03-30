import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@app': resolve(__dirname, 'src/app'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
  server: {
    proxy: {
      '/file-upload': 'http://localhost:3001',
    },
  },
  build: {
    outDir: 'dist',
  },
});
