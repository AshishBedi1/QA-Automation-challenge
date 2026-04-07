# QA automation challenge

Minimal monorepo for a Playwright end-to-end flow: **npm install** at the repo root, then **npm run test:e2e**. Works on Linux with Node 20 and npm (no pnpm-only features).

## Layout

- **client** — Vite + React; `/` serves the Course Marketplace UI (dev server).
- **server** — Small Node HTTP API: `GET /api/health`, `GET /api/courses`, `POST /api/purchase` (and **`/health`**, **`/courses`**, **`/purchase`** aliases for Savyre Live Preview, which may forward stripped paths to the workspace API). Port from `PORT` (default `3000`).
- **e2e** — Playwright tests; **do not hardcode ports**. The runner sets `BASE_URL` (see `playwright.config.cjs`).

## Quick start

```bash
git clone <your-repo-url>
cd qa-automation-challenge
npm install
```

### One-time: Playwright browsers (local / IDE)

```bash
npx playwright install
```

If the command finishes but prints **“Host system is missing dependencies to run browsers”**, install OS libraries (Linux; use **`sudo`** if needed):

```bash
sudo npx playwright install-deps
```

Or install the **`apt`** packages Playwright lists (GTK/Cairo, etc.). Some IDE images ship browsers/deps preinstalled — follow your environment docs.

### Run E2E

```bash
npm run test:e2e
```

## Savyre IDE / containers (`~/workspace`)

- **`@playwright/test`** and **`tree-kill`** are root **`dependencies`** so **`npm install`** without devDependencies still works for **`scripts/run-e2e.js`**.
- **`scripts/run-e2e.js`** uses **readiness URLs and `BASE_URL` on `http://127.0.0.1:<port>`** (not `localhost` alone), starts Vite with **`--host 0.0.0.0`** so IPv4 loopback works, and sets **`API_PORT`** for the client proxy. The API binds **`0.0.0.0`**. The Vite dev proxy targets **`http://127.0.0.1:${API_PORT}`** explicitly.
- Optional override: **`E2E_PROBE_HOST`** if your environment cannot use **`127.0.0.1`** for probes.
- Manual **`npm run dev -w client`** uses plain **`vite`**; **`run-e2e`** adds **`--port --strictPort --host 0.0.0.0`**.
- **Live Preview:** The UI uses relative **`/api/courses`** and **`/api/purchase`** (Vite proxies to the API locally). The API also serves **`GET /courses`** and **`POST /purchase`** so preview proxies that strip the `/api` prefix still hit a valid route.

### Local dev (two terminals, repo root)

```bash
npm run dev -w server
```

```bash
npm run dev -w client
```

Open the Vite URL (e.g. `http://127.0.0.1:5173`). The catalog should load; **`GET /api/courses`** is proxied to the API.

### Playwright cache paths

Browsers may cache under **`~/.cache/ms-playwright`** or e.g. **`/config/.cache/ms-playwright`** in sandboxes.

## License

MIT — see [LICENSE](./LICENSE).
