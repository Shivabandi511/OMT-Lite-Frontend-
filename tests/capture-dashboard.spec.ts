import { test, expect } from '@playwright/test';

async function loginAs(page, email, password) {
  const response = await page.request.post('http://localhost:8080/api/auth/login', {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();

  await page.goto('/');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('omt_token', token);
      localStorage.setItem('omt_user', JSON.stringify(user));
    },
    { token: data.token, user: data.user }
  );
}

test('Capture mobile dashboard screenshot with dynamic greeting and without refresh button', async ({ page }) => {
  await loginAs(page, 'admin@omt.com', 'Admin@123');
  await page.setViewportSize({ width: 440, height: 956 });
  await page.goto('/dashboard');
  await page.waitForSelector('text=Recent Vehicle Assets in Yard');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-dashboard-no-refresh.png' });
});
