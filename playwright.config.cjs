const { defineConfig } = require('@playwright/test');

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
