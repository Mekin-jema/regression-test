import { Page } from '@playwright/test';

export class OtpVerifyPage {
  constructor(private page: Page) {}
  async inputOtpAndVerify(otp: string) {
    await this.page.getByRole('heading', { name: /verify your email address/i }).waitFor({ timeout: 20000 });
    const inputs = this.page.getByRole('textbox');
    await inputs.first().waitFor({ state: 'visible', timeout: 20000 });
    for (let i = 0; i < otp.length; i++) {
      await inputs.nth(i).fill(otp[i]);
    }
    const verifyButton = this.page.getByRole('button', { name: /verify/i });
    await verifyButton.waitFor({ state: 'attached', timeout: 10000 });
    const isEnabled = await verifyButton.isEnabled();
    if (isEnabled) {
      await verifyButton.click();
    } else {
      const inputCount = await inputs.count();
      const lastIndex = Math.min(otp.length - 1, inputCount - 1);
      await inputs.nth(lastIndex).press('Enter');
    }
  }
}
