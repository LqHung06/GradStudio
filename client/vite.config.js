import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// The front end only calls relative /api paths. Both the dev server and
// `vite preview` forward them to the mock (PA#3) or Express (PA#4) on port 3001.
const api = { '/api': 'http://localhost:3001' };

export default defineConfig({
  plugins: [react()],
  // Absolute base: nested routes such as /my-bookings/GS-1024 must still load /assets/...
  base: '/',
  server: { proxy: api },
  preview: { proxy: api },
  build: {
    rollupOptions: {
      // PA#2 pages stay until the single-page router replaces them (front-end foundation step).
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        studio: resolve(import.meta.dirname, 'studio.html'),
        booking: resolve(import.meta.dirname, 'booking.html'),
      },
    },
  },
});
