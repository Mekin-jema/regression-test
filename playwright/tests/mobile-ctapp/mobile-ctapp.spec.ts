import { test, expect } from '@playwright/test';

test.describe('Mobile CTAPP Smoke Tests', () => {
  test('Login page visible', async ({ page }) => {
    await page.goto('CTAPP Login');
    await expect(page.locator('body')).toBeVisible();
  });
});
