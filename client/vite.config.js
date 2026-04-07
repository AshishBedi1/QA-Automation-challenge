import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiPort = process.env.API_PORT || '3000'
// Prefer localhost over 127.0.0.1: some containers answer HTTP on "localhost" only.
const rawHost = process.env.E2E_DEV_HOST || 'localhost'
const host = rawHost === '127.0.0.1' ? 'localhost' : rawHost

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://${host}:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
})
