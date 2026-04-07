import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiPort = process.env.API_PORT || '3000'
const rawHost = process.env.E2E_DEV_HOST || 'localhost'

/** 127.0.0.1 → localhost; IPv6 literals (::1) need brackets in URLs. */
function proxyOrigin(host, port) {
  if (host === '127.0.0.1') {
    return `http://localhost:${port}`
  }
  if (host.includes(':')) {
    return `http://[${host}]:${port}`
  }
  return `http://${host}:${port}`
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: proxyOrigin(rawHost, apiPort),
        changeOrigin: true,
      },
    },
  },
})
