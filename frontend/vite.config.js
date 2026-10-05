
// vite.config.js is doing the following:
// 1. Importing the React plugin for Vite
// 2. Defining the Vite configuration using defineConfig
// 3. Setting up a proxy to forward API requests to the backend server running on port 5001

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Vite configuration for React project
  plugins: [react()],
  server: {
    // Proxy configuration to forward API requests to the backend server
    proxy: {
      '/customers': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/products': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/wishlist': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
