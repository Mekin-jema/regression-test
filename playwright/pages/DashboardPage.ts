import { expect, Page } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}
  async assertLoaded() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/dashboard/i, { timeout: 30000 });
  }
  async openPartnerManagement() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.getByText('Partner Management', { exact: false }).first().click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/merchant-onboarding|partner-management|partnerhub/i, { timeout: 20000 });
    await expect(this.page).toHaveTitle(/Merchant Onboarding Portal|Partner Management|One Platform/i);
    await expect(this.page.locator('body')).toContainText(/Partner Management/i);
  }
  async verifyDashboardLoaded() {
    await expect(this.page.locator('body')).toBeVisible();
  }

}
