import { test, expect } from '@playwright/test';

test.describe('Course Marketplace', () => {
  test('home page loads with catalog heading', async ({ page }) => {
    // Do not use waitForResponse(/api/courses): it is flaky in some Docker/Playwright
    // setups (response events vs fetch timing). Proxy + API are validated by the UI:
    // <h1> only renders after /api/courses succeeds (see App.jsx).
    await page.goto('/');

    await expect(page).toHaveTitle(/Course Marketplace/);
    await expect(page.getByText(/loading courses/i)).not.toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByText(/failed to load courses/i),
      '/api/courses failed in the browser (often Chromium proxy vs curl). Check playwright launchOptions and run-e2e NO_PROXY.',
    ).not.toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Course Marketplace', level: 1 }),
      'Catalog should render after courses load.',
    ).toBeVisible({ timeout: 60_000 });
    await expect(
      page.getByText(/Browse courses and buy your next skill/i),
    ).toBeVisible({ timeout: 15_000 });
  });
});
