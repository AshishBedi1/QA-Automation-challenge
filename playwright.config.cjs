const { defineConfig } = require('@playwright/test');

/** Set by scripts/run-e2e.js via BASE_URL only (e.g. http://127.0.0.1:<uiPort>). No hardcoded URLs. */
const baseURL = process.env.BASE_URL || '';

module.exports = defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: baseURL || undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Chromium in Linux/Docker often needs these or JS never runs (static title passes, no <h1>).
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        // curl can hit localhost while Chromium still uses a system/proxy path in some Docker setups
        '--proxy-server=direct://',
      ],
    },
  },
});
