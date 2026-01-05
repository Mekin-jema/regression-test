import { test } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe('Dashboard', () => {
  test('Dashboard loads successfully', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await page.goto('/dashboard');
    await dashboard.verifyDashboardLoaded();
  });
});
