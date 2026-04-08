import { test, expect } from '@playwright/test';

test.describe('Course Marketplace', () => {
  test('home page loads with catalog heading', async ({ page }) => {
    // Listener must attach before navigation — /api/courses fires during initial load.
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/courses') && r.ok(),
        { timeout: 60_000 },
      ),
      page.goto('/'),
    ]);

    await expect(page).toHaveTitle(/Course Marketplace/);
    await expect(
      page.getByRole('heading', { name: 'Course Marketplace', level: 1 }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByText(/Browse courses and buy your next skill/i),
    ).toBeVisible({ timeout: 15_000 });
  });
});
