import { test, expect } from '@playwright/test';

test.describe('Course Marketplace', () => {
  test('home page loads with catalog heading', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Course Marketplace/);
    await expect(
      page.getByRole('heading', { name: 'Course Marketplace', level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(/Browse courses and buy your next skill/i)).toBeVisible();
  });
});
