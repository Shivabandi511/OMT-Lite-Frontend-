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

test.describe('Dashboard Greeting & QA Logout Protection Suite', () => {
  test('1. Dashboard dynamic greeting and refresh button removal', async ({ page }) => {
    await loginAs(page, 'admin@omt.com', 'Admin@123');
    await page.goto('/dashboard');
    await page.waitForSelector('h1');

    const h1Text = await page.locator('h1').textContent();
    console.log('Dashboard Greeting H1:', h1Text);

    // Current hour is 22 (10pm), so greeting should be "Good evening"
    const currentHour = new Date().getHours();
    if (currentHour >= 17 || currentHour < 5) {
      expect(h1Text).toContain('Good evening');
    } else if (currentHour >= 12) {
      expect(h1Text).toContain('Good afternoon');
    } else {
      expect(h1Text).toContain('Good morning');
    }

    // Verify Refresh button is removed
    const refreshBtn = page.locator('button:has-text("Refresh")');
    await expect(refreshBtn).toHaveCount(0);
  });

  test('2. QA Validation: Logout smooth redirect, back button, and browser refresh protection', async ({ page }) => {
    await loginAs(page, 'admin@omt.com', 'Admin@123');
    await page.goto('/profile');
    await page.waitForSelector('text=Profile');

    // 1. Click Sign Out
    const signoutBtn = page.locator('button:has-text("Sign out")').first();
    await expect(signoutBtn).toBeVisible();
    await signoutBtn.click();

    // Verify smooth redirect to login/mfa/login
    await expect(page).toHaveURL(/.*mfa\/login|.*login/);
    await expect(page.locator('h1.auth-title')).toContainText('Sign in');

    // Verify authentication tokens cleared from localStorage
    const token = await page.evaluate(() => localStorage.getItem('omt_token'));
    const user = await page.evaluate(() => localStorage.getItem('omt_user'));
    expect(token).toBeNull();
    expect(user).toBeNull();

    // 2. QA Test: Try Refreshing the browser after logout
    await page.reload();
    await expect(page).toHaveURL(/.*mfa\/login|.*login/);
    await expect(page.locator('h1.auth-title')).toContainText('Sign in');

    // 3. QA Test: Try pressing browser Back button
    await page.goBack();
    await page.waitForTimeout(600);
    // ProtectedRoute must intercept and block access back into the app
    await expect(page).toHaveURL(/.*mfa\/login|.*login/);

    // 4. Try navigating directly to protected dashboard URL
    await page.goto('/dashboard');
    await page.waitForTimeout(600);
    await expect(page).toHaveURL(/.*mfa\/login|.*login/);
    await expect(page.locator('h1.auth-title')).toContainText('Sign in');
  });
});
