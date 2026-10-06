import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The dev server proxies /api/* to the openHealth backend so the browser
// sees a same-origin request. In production set VITE_API_BASE_URL instead.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // The backend's root banner, read by the sign-in screens' status line.
      // Rewritten because the backend serves it at "/", not "/health".
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/health/, '/'),
      },
    },
  },
})
