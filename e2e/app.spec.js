import { test, expect } from '@playwright/test';

test.describe('Course Marketplace', () => {
  test('home page loads with catalog heading', async ({ page }) => {
    // App.jsx only renders <h1> after /api/courses succeeds; avoid waitForResponse:
    // in some CI/Savyre runs the network response shape/timing differs from local Playwright.
    // Assert on the visible catalog shell instead (same as manual verification).
    await page.goto('/');

    await expect(page).toHaveTitle(/Course Marketplace/);
    await expect(
      page.getByRole('heading', { name: 'Course Marketplace', level: 1 }),
    ).toBeVisible({ timeout: 60_000 });
    await expect(
      page.getByText(/Browse courses and buy your next skill/i),
    ).toBeVisible({ timeout: 15_000 });
  });
});
