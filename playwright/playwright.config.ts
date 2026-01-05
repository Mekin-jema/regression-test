import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  retries: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'https://safaricom-partnerhub.safaricom.et',
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    
    
  },

});
