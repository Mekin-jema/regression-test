import { test, expect } from '@playwright/test';

test.describe('CTAPP Back Office', () => {
  test('POS Outlet Management loads', async ({ page }) => {
    await page.goto('https://safaricom-partner-hub-ctapp-backoffice-management.prod.sma2.safaricomet.net/posOutletManagement');
    await expect(page.locator('body')).toBeVisible();
  });
});
