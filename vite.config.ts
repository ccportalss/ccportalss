import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
          react: ['react', 'react-dom']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'react', 'react-dom']
  },
  assetsInclude: ['**/*.pdf'],
  define: {
    global: 'globalThis',
  }
});