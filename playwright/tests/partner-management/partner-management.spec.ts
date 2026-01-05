import { test, expect } from '@playwright/test';

const pages = [
  '/merchant-onboarding',
  '/merchant-onboarding/BaOnboarding',
  '/merchant-onboarding/partner',
  '/merchant-onboarding/merchantReport',
  '/merchant-onboarding/dsa-dsp',
];

test.describe('Partner Management', () => {
  for (const url of pages) {
    test(`Load page: ${url}`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
