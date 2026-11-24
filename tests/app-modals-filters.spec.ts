import { test, expect } from '@playwright/test';

async function loginAs(page, email, password) {
  const response = await page.request.post('http://localhost:8080/api/auth/login', {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();

  await page.goto('/mfa/login');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('omt_token', token);
      localStorage.setItem('omt_user', JSON.stringify(user));
    },
    { token: data.token, user: data.user }
  );
  await page.goto('/dashboard');
}

test.describe('Application Confirmation Modal, Vehicle Filter Pills & Responsive Logout', () => {
  test('1. Application-level confirmation popup replaces native browser dialog on vehicle status advance', async ({ page }) => {
    // Listen for any native dialogs - none should appear!
    let nativeDialogAppeared = false;
    page.on('dialog', async (dialog) => {
      nativeDialogAppeared = true;
      console.log('UNEXPECTED native dialog:', dialog.message());
      await dialog.dismiss();
    });

    await loginAs(page, 'admin@omt.com', 'Admin@123');

    // Go to vehicle #6 (or first available vehicle)
    await page.goto('/vehicles');
    await page.waitForSelector('text=Vehicle Asset Management');

    // Find first vehicle link
    const firstVehicleLink = page.locator('a[href^="/vehicles/"]').first();
    await firstVehicleLink.click();
    await page.waitForSelector('h1');

    // Check if status advance button exists (e.g. Start Dismantling or Complete Dismantling)
    const advanceBtn = page.locator('button:has-text("Start Dismantling"), button:has-text("Complete Dismantling")').first();
    if (await advanceBtn.isVisible()) {
      await advanceBtn.click();

      // Verify Application-Level Confirmation Modal is displayed
      const modalTitle = page.locator('#omt-confirm-title');
      await expect(modalTitle).toBeVisible();
      await expect(modalTitle).toContainText(/Advance Vehicle Status|Complete Vehicle Dismantling/);

      // Verify modal body has details
      const modalBody = page.locator('div[role="dialog"]');
      await expect(modalBody).toBeVisible();
      await expect(modalBody).toContainText('OMT Platform Confirmation');

      // Verify Cancel button closes the modal
      const cancelBtn = modalBody.locator('button:has-text("Cancel")');
      await expect(cancelBtn).toBeVisible();
      await cancelBtn.click();
      await expect(modalTitle).not.toBeVisible();

      // Ensure NO native browser alert/confirm appeared
      expect(nativeDialogAppeared).toBe(false);
    }
  });

  test('2. Vehicle List modern status pills without clunky dropdowns', async ({ page }) => {
    await loginAs(page, 'admin@omt.com', 'Admin@123');
    await page.goto('/vehicles');
    await page.waitForSelector('text=Vehicle Asset Management');

    // Verify status filter pills are visible with counts
    const allStatusesPill = page.locator('button:has-text("All Statuses")');
    await expect(allStatusesPill).toBeVisible();

    const receivedPill = page.locator('button:has-text("Received")').first();
    await expect(receivedPill).toBeVisible();

    // Verify routing filter pills are visible
    const allRoutingPill = page.locator('button:has-text("All Routing")');
    await expect(allRoutingPill).toBeVisible();

    // Click Received pill - filters without any dropdown popup
    await receivedPill.click();
    await page.waitForTimeout(400);

    // Verify Reset button appears
    const resetBtn = page.locator('button:has-text("Reset")');
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await page.waitForTimeout(400);
  });

  test('3. Responsive Profile logout with immediate visual touch response', async ({ page }) => {
    await loginAs(page, 'admin@omt.com', 'Admin@123');
    await page.goto('/profile');
    await page.waitForSelector('text=Profile');

    const signoutBtn = page.locator('button:has-text("Sign out"), button:has-text("Sign Out")').first();
    await expect(signoutBtn).toBeVisible();

    // Click Sign out - opens confirmation modal
    await signoutBtn.click();
    
    // Check if modal appears
    const modalTitle = page.locator('#omt-confirm-title');
    if (await modalTitle.isVisible()) {
      await expect(modalTitle).toHaveText('Sign Out of OMT Lite');
      const confirmBtn = page.locator('div[role="dialog"] button:has-text("Sign Out")');
      await confirmBtn.click();
    }

    await expect(page).toHaveURL(/.*mfa\/login|.*login/);
    await expect(page.locator('h1.auth-title')).toContainText('Sign in');

    // Verify storage cleared
    const token = await page.evaluate(() => localStorage.getItem('omt_token'));
    expect(token).toBeNull();
  });
});
