import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiPort = process.env.API_PORT || '3000'
const host = process.env.E2E_DEV_HOST || 'localhost'

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
