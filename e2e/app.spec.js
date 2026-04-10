import { test, expect } from '@playwright/test';

/**
 * Candidate task: implement the Playwright checks below.
 * Application code matches `main`; only this spec is incomplete until you finish it.
 *
 * Contract (see `.savyre/bug-info.json` and README):
 * - Open `/` — document title should match /Course Marketplace/
 * - "Loading courses" should disappear; no stuck "failed to load courses"
 * - Visible h1 "Course Marketplace"
 * - Visible tagline containing "Browse courses and buy your next skill"
 *
 * Local check: `npm run test:e2e` from repo root.
 */
test.describe('Course Marketplace', () => {
  test('home page loads with catalog heading', async ({ page }) => {
    await page.goto('/');

    // TODO: Replace this placeholder with real assertions (title, loading/error states, h1, tagline).
    // Remove the line below when your tests are complete.
    await expect(page.getByTestId('candidate-placeholder-remove-me')).toBeVisible();
  });
});
