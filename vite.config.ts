/// <reference types="vite/client" />

import path from 'node:path';

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command }) => ({
  base: '/',
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: command === 'build',
    }),
    react(),
    viteTsconfigPaths(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}));
