import { test, expect } from '@playwright/test';

test.describe('Course Marketplace', () => {
  test('home page loads with catalog heading', async ({ page }) => {
    // App.jsx only renders <h1> after /api/courses succeeds; until then the page shows "Loading courses…".
    // Register the response waiter before navigation so we never miss a fast response (Promise.all can race).
    const coursesResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/courses') && res.ok(),
      { timeout: 45_000 },
    );
    await page.goto('/');
    await coursesResponsePromise;

    await expect(page).toHaveTitle(/Course Marketplace/);
    await expect(
      page.getByRole('heading', { name: 'Course Marketplace', level: 1 }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText(/Browse courses and buy your next skill/i),
    ).toBeVisible({ timeout: 15_000 });
  });
});
