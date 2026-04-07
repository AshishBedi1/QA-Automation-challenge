const { defineConfig } = require('@playwright/test');

/** Set by scripts/run-e2e.js only (e.g. http://[::1]:PORT). Never hardcode hosts/ports. */
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
