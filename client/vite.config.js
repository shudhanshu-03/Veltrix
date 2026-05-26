import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In production (Vercel), /api/* is handled by serverless functions — no proxy needed.
// In local dev, proxy /api to the Express server on port 3000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
