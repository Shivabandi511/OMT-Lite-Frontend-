import { test, expect } from '@playwright/test';

test('Capture mobile profile without session management card', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const res = await page.request.post('http://localhost:8080/api/auth/login', {
    data: { email: 'admin@omt.com', password: 'Admin@123' },
  });
  const data = await res.json();
  await page.goto('/mfa/login');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('omt_token', token);
      localStorage.setItem('omt_user', JSON.stringify(user));
    },
    { token: data.token, user: data.user }
  );

  await page.goto('/profile');
  await page.waitForSelector('text=Profile');

  // Verify "Session Management" text is NOT present
  const sessionMgmt = page.locator('text=Session Management');
  await expect(sessionMgmt).toHaveCount(0);

  // Scroll to bottom and take screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity/brain/9aa81cff-6053-42da-bef0-94f2364b24c5/test-profile-bottom-no-session.png' });
});
