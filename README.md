# QA automation challenge

Minimal monorepo for a Playwright end-to-end flow: **npm install** at the repo root, then **npm run test:e2e**. Works on Linux with Node 20 and npm (no pnpm-only features).

## Layout

- **client** — Vite + React; `/` serves the Course Marketplace UI (dev server).
- **server** — Small Node HTTP API: `GET /api/health` (200 when up), `GET /api/courses`, `POST /api/purchase`. Port from `PORT` (default `3000`).
- **e2e** — Playwright tests; **do not hardcode ports**. The runner sets `BASE_URL` (see `playwright.config.cjs`).

## Quick start

```bash
git clone <your-repo-url>
cd qa-automation-challenge
npm install
```

Install Playwright browsers once per machine (required before tests can run):

```bash
npx playwright install
```

Run end-to-end tests (starts API + Vite on free ports, then runs Playwright):

```bash
npm run test:e2e
```

## Dependencies and IDE (Savyre / containers)

- **`@playwright/test`** and **`tree-kill`** are listed under **`dependencies`** in the root `package.json` so a normal **`npm install`** (including environments that omit devDependencies) still has what **`scripts/run-e2e.js`** needs.
- **`scripts/run-e2e.js`** probes **`http://[::1]:<port>/...`** by default (`E2E_PROBE_HOST` defaults to **`::1`**). In some environments Vite listens on IPv6 loopback only; **`http://localhost`** can resolve to **`127.0.0.1`** and hang. **`BASE_URL`** for Playwright uses the same host (e.g. **`http://[::1]:<uiPort>`**). Override if needed: `E2E_PROBE_HOST=localhost npm run test:e2e`.
- Manual **`npm run dev -w client`** stays **`vite` only**; the e2e script passes **`--port --strictPort --host`** to match the probe host.

### Playwright browsers and OS libraries (Linux / IDE images)

After **`npx playwright install`**, if the browser fails to start, install system dependencies (Linux):

```bash
npx playwright install-deps
```

Or use **`sudo`** when the image requires it. Missing GTK / libnss often shows up as host-deps warnings in headless/IDE runs.

## License

MIT — see [LICENSE](./LICENSE).
