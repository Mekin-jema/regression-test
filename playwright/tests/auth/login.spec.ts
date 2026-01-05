import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Authentication', () => {
  test('Login should succeed', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('valid_user', 'valid_password');
    await loginPage.assertLoginSuccess();
  });
});
