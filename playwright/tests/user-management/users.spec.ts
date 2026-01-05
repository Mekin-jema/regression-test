import { test, expect } from '@playwright/test';

test.describe('Users Management', () => {
  test('Users page loads', async ({ page }) => {
    await page.goto('/users');
    await expect(page.locator('body')).toBeVisible();
  });
});
