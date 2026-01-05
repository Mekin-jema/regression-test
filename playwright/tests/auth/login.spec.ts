import { test } from '@playwright/test';
import {ImapOtpReader} from "../../utils/otp-reader"
import { LoginPage } from '../../pages/LoginPage';
import { OtpVerifyPage } from '../../pages/OtpVerifyPage';
import { DashboardPage } from '../../pages/DashboardPage';

import dotenv from 'dotenv';
dotenv.config();
test.describe('Authentication', () => {
  test('Login should succeed', async ({ page }) => {
    const username = process.env.LOGIN_USERNAME || process.env.GMAIL_USER || '';
  const password = process.env.LOGIN_PASSWORD || '';

    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.LOGIN_USERNAME || process.env.GMAIL_USER || '', process.env.LOGIN_PASSWORD || '');
    // await loginPage.assertLoginSuccess();
     // Wait briefly for OTP email
  await page.waitForTimeout(5000);

  // Read OTP via class service
  const otpService = new ImapOtpReader();
  const otp = await otpService.getEmailOTP({
    subjectFilter: process.env.GMAIL_SUBJECT_FILTER,
    senderFilter: process.env.GMAIL_SENDER_FILTER,
  });

  const otpVerify = new OtpVerifyPage(page);
  await otpVerify.inputOtpAndVerify(otp);
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.assertLoaded();
  await dashboardPage.verifyDashboardLoaded();



  });
});
