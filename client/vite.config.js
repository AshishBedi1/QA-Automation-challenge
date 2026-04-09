import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/** Strip Savyre-injected preview globals from index.html so local e2e uses `/api` + Vite proxy only. */
function stripPreviewInjectForE2e() {
  return {
    name: 'strip-preview-inject-e2e',
    transformIndexHtml(html) {
      if (process.env.RUN_E2E !== '1') return html
      return html.replace(
        /<script>window\.__PREVIEW_BASENAME__="[^"]*";window\.__PREVIEW_API_BASE__="[^"]*";<\/script>\s*/g,
        ''
      )
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiPort = env.API_PORT || process.env.API_PORT || '3000'

  return {
    plugins: [react(), stripPreviewInjectForE2e()],
    server: {
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
