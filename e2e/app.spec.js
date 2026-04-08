import { test, expect } from '@playwright/test';

test.describe('Course Marketplace', () => {
  test('home page loads with catalog heading', async ({ page }) => {
    // Listener must attach before navigation — /api/courses fires during initial load.
    // Match URL only: if the proxy returns 404, r.ok() in the predicate would never match → timeout.
    const [coursesResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/courses'),
        { timeout: 60_000 },
      ),
      page.goto('/'),
    ]);
    expect(
      coursesResponse.status(),
      `GET /api/courses should be 200 (check Vite API_PORT / server). Got ${coursesResponse.status()} for ${coursesResponse.url()}`,
    ).toBe(200);

    await expect(page).toHaveTitle(/Course Marketplace/);
    await expect(
      page.getByRole('heading', { name: 'Course Marketplace', level: 1 }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByText(/Browse courses and buy your next skill/i),
    ).toBeVisible({ timeout: 15_000 });
  });
});
