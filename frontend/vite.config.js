import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El backend Express corre en :3000 y sirve /api.
// En dev, Vite (5173) proxya /api hacia allí.
// En prod, `vite build` genera dist/ y Express lo sirve como estático.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
