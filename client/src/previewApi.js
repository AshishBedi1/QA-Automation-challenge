/**
 * Dashboard preview sets `window.__PREVIEW_API_BASE__` to the IDE preview-api path.
 * Local e2e uses plain `/api/...` via Vite proxy (preview script stripped when RUN_E2E=1).
 */
export function previewAwareFetch(path, init) {
  const base =
    typeof window !== 'undefined' && window.__PREVIEW_API_BASE__
      ? String(window.__PREVIEW_API_BASE__).replace(/\/$/, '')
      : ''
  if (!base) {
    return fetch(path, init)
  }
  const suffix = path.replace(/^\/api/, '') || '/'
  return fetch(`${base}${suffix}`, init)
}
