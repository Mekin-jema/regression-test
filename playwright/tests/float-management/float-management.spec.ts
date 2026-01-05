import { test, expect } from '@playwright/test';

const floatPages = [
  '/float-management',
  '/float-management/floatManagement',
  '/float-management/floatTransferReport',
  '/float-management/floatConfiguration',
  '/float-management/performanceDashboard',
  '/float-management/floatReport',
];

test.describe('Float Management', () => {
  for (const url of floatPages) {
    test(`Load page: ${url}`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
