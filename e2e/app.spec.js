import { test, expect } from '@playwright/test';

test.describe('Course Marketplace', () => {
  test('home page loads with catalog heading', async ({ page }) => {
    // App.jsx only renders <h1> after /api/courses succeeds; until then the page shows "Loading courses…".
    // In CI / Savyre the API can be slower than the default 5s assertion timeout — wait for the API first.
    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/api/courses') && res.ok(),
        { timeout: 45_000 },
      ),
      page.goto('/'),
    ]);

    await expect(page).toHaveTitle(/Course Marketplace/);
    await expect(
      page.getByRole('heading', { name: 'Course Marketplace', level: 1 }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText(/Browse courses and buy your next skill/i),
    ).toBeVisible({ timeout: 15_000 });
  });
});
