import { test, expect } from '@playwright/test';

async function loginAs(page, email, password) {
  const response = await page.request.post('http://localhost:8080/api/auth/login', {
    data: { email, password },
  });
  const data = await response.json();
  await page.goto('/mfa/login');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('omt_token', token);
      localStorage.setItem('omt_user', JSON.stringify(user));
    },
    { token: data.token, user: data.user }
  );
}

test('Capture screenshots of application confirmation modal and vehicle filter pills', async ({ page }) => {
  // Mobile viewport matching user's iPhone screenshot
  await page.setViewportSize({ width: 390, height: 844 });

  await loginAs(page, 'admin@omt.com', 'Admin@123');

  // 1. Vehicle List mobile view
  await page.goto('/vehicles');
  await page.waitForSelector('text=Vehicle Asset Management');
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity/brain/9aa81cff-6053-42da-bef0-94f2364b24c5/test-vehicles-pills-mobile.png' });

  // 2. Vehicle 6 Detail view with Application Confirmation Modal
  await page.goto('/vehicles/6');
  await page.waitForSelector('h1');
  const advanceBtn = page.locator('button:has-text("Start Dismantling"), button:has-text("Complete Dismantling")').first();
  if (await advanceBtn.isVisible()) {
    await advanceBtn.click();
    await page.waitForSelector('#omt-confirm-title');
    await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity/brain/9aa81cff-6053-42da-bef0-94f2364b24c5/test-app-confirm-modal-mobile.png' });
  }

  // 3. Profile view
  await page.goto('/profile');
  await page.waitForSelector('text=Profile');
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity/brain/9aa81cff-6053-42da-bef0-94f2364b24c5/test-profile-mobile.png' });
});
