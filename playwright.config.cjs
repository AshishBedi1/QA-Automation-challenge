const { defineConfig } = require('@playwright/test');

/** Set by scripts/run-e2e.js via BASE_URL only (e.g. http://127.0.0.1:<uiPort>). No hardcoded URLs. */
const baseURL = process.env.BASE_URL || '';

module.exports = defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: baseURL || undefined,
    trace: 'on-first-retry',
  },
});
