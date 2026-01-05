import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyDashboardLoaded() {
    await expect(this.page.locator('body')).toBeVisible();
  }
}
