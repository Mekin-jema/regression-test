import { Page } from '@playwright/test';

export class PartnerManagementPage {
  constructor(private page: Page) {}

  private goToButtons() {
    return this.page.getByRole('button', { name: /exclamation-circle Go To/i });
  }

  private async clickDownloadWithFallback() {
    const btn = this.page.getByRole('button', { name: /download\s+download\s+report/i }).first();
    try {
      await btn.waitFor({ state: 'visible', timeout: 4000 });
    } catch {}
    const context = this.page.context();
    const downloadWait = this.page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
    const newPageWait = context.waitForEvent('page', { timeout: 8000 }).catch(() => null);
    try {
      await btn.click({ trial: false });
    } catch {
      const retryBtn = this.page.getByRole('button', { name: /download\s+download\s+report/i }).first();
      try { await retryBtn.click({ trial: false }); } catch {}
    }
    const [dl, newPg] = await Promise.all([downloadWait, newPageWait]);
    if (dl) {
      try { await dl.path(); } catch {}
      return;
    }
    if (newPg) {
      try { await newPg.waitForLoadState('domcontentloaded', { timeout: 5000 }); } catch {}
      try { await newPg.close(); } catch {}
    }
  }

  async processBaRow() {
    const buttons = this.goToButtons();
    for (let idx = 0; idx <= 3; idx++) {
      await buttons.nth(idx).click();
      await this.page.waitForLoadState('networkidle');
      const onboarding = this.page.getByText('PARTNER ONBOARDING - BA');
      try {
        await onboarding.waitFor({ state: 'visible', timeout: 7000 });
        await onboarding.click();
        await this.page.waitForLoadState('networkidle');
        await this.clickDownloadWithFallback();
      } catch {}
      await this.page.waitForTimeout(1000);
      await this.page.goBack();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async processReverificationRow() {
    const buttons = this.goToButtons();
    for (let idx = 4; idx <= 7; idx++) {
      await buttons.nth(idx).click();
      await this.page.waitForLoadState('networkidle');
      const onboarding = this.page.getByText('PARTNER ONBOARDING - BA');
      try {
        await onboarding.waitFor({ state: 'visible', timeout: 7000 });
        await onboarding.click();
        await this.page.waitForLoadState('networkidle');
        await this.clickDownloadWithFallback();
      } catch {}
      await this.page.waitForTimeout(1000);
      await this.page.goBack();
      await this.page.waitForLoadState('networkidle');
    }
  }
}
