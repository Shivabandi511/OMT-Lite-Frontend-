import { test, expect } from '@playwright/test';

// Helper to login and set session
async function loginAs(page, email, password) {
  // Direct API login for quick test setup
  const response = await page.request.post('http://localhost:8080/api/auth/login', {
    data: { email, password }
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();

  await page.goto('/');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('omt_token', token);
    localStorage.setItem('omt_user', JSON.stringify(user));
  }, { token: data.token, user: data.user });
}

test.describe('OMT Platform End-to-End Automation Suite', () => {

  test('1. Authentication & Profile Settings (Admin & Staff)', async ({ page }) => {
    // Login as Admin
    await loginAs(page, 'admin@omt.com', 'Admin@123');

    // Go to Dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to Profile page
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*profile/);

    // Verify Profile header elements
    await expect(page.locator('h1')).toContainText('Profile');
    await expect(page.locator('text=Manage your account settings and password')).toBeVisible();

    // Verify User details card
    await expect(page.locator('text=Full Name')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();

    // Verify Change Password card
    await expect(page.locator('h2:has-text("Change Password")')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter current password"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Uppercase, lowercase, number & symbol"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Re enter new password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Change Password")')).toBeVisible();

    // Verify Sign out button is present
    await expect(page.locator('button:has-text("Sign out")')).toBeVisible();
  });

  test('2. Collapsible Sidebar Functionality', async ({ page }) => {
    await loginAs(page, 'admin@omt.com', 'Admin@123');
    await page.goto('/dashboard');

    const aside = page.locator('aside');
    await expect(aside).toBeVisible();

    // Collapse toggle button
    const collapseBtn = aside.locator('button[data-tooltip*="Collapse"], button[data-tooltip*="Expand"]');
    await expect(collapseBtn).toBeVisible();

    // Click collapse
    await collapseBtn.click();
    await page.waitForTimeout(400);

    // Verify sidebar is in collapsed width (around 68px)
    const box = await aside.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(75);

    // Click to expand again
    await collapseBtn.click();
    await page.waitForTimeout(400);
    const expandedBox = await aside.boundingBox();
    expect(expandedBox?.width).toBeGreaterThanOrEqual(230);
  });

  test('3. Yard Management: Creation by Staff & Admin, Deactivation Restriction for Staff', async ({ page }) => {
    // Test Staff Role: Staff CAN create yards, but CANNOT deactivate
    await loginAs(page, 'staff@omt.com', 'Staff@123');
    await page.goto('/yards');
    await expect(page).toHaveURL(/.*yards/);

    // Verify "+ New Yard" button is visible and usable by Staff
    const newYardBtn = page.locator('button:has-text("New Yard")');
    await expect(newYardBtn).toBeVisible();

    // Open New Yard modal
    await newYardBtn.click();
    await expect(page.locator('h2:has-text("New Yard")')).toBeVisible();

    // Fill new yard details
    const uniqueYardName = `Staff Auto Yard ${Date.now().toString().slice(-4)}`;
    await page.fill('input[placeholder="e.g. Sacramento Main Yard"]', uniqueYardName);
    await page.fill('input[placeholder="e.g. Sacramento"]', 'Sacramento');
    await page.fill('input[placeholder="Street address"]', '8842 Logistics Blvd, Dock 4');

    // Submit yard creation
    await page.click('button[type="submit"]:has-text("Create Yard")');

    // Verify success banner and yard appears in table
    await expect(page.locator('text=Yard successfully created')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${uniqueYardName}`)).toBeVisible();

    // Now visit an existing yard to test Deactivation restriction for Staff
    await page.goto('/yards/1');
    await expect(page.locator('text=Yard Details').or(page.locator('text=Assigned Vehicles'))).toBeVisible();

    // Verify that Staff DOES NOT have a Deactivate Yard button
    await expect(page.locator('button:has-text("Deactivate Yard")')).not.toBeVisible();
    await expect(page.locator('text=Admin only')).toBeVisible();

    // Test Admin Role: Admin has deactivation button, but cannot deactivate if active vehicles exist
    await loginAs(page, 'admin@omt.com', 'Admin@123');
    await page.goto('/yards/1');

    // Automatically accept window.confirm dialogs
    page.on('dialog', dialog => dialog.accept());

    // Yard 1 (Rotterdam) has active vehicles assigned
    await expect(page.locator('button:has-text("Deactivate Yard")')).toBeVisible();
    await page.click('button:has-text("Deactivate Yard")');

    // System must block deactivation because active vehicles are assigned
    await expect(
      page.locator('text=Cannot deactivate yard').or(page.locator('text=active vehicle'))
    ).toBeVisible();
  });

  test('4. Vehicle Asset Management & VIN Searching', async ({ page }) => {
    await loginAs(page, 'admin@omt.com', 'Admin@123');
    await page.goto('/vehicles');
    await expect(page).toHaveURL(/.*vehicles/);

    // 1. Search for seeded VIN: 1HGCR2F83HA001924 (Honda Accord EX-L)
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('1HGCR2F83HA001924');
    await page.waitForTimeout(600);

    // Verify the filtered result
    await expect(page.locator('text=1HGCR2F83HA001924').first()).toBeVisible();
    await expect(page.locator('text=Honda').first()).toBeVisible();
    await expect(page.locator('text=Accord EX-L').first()).toBeVisible();

    // 2. Test partial VIN search: last digits '001924'
    await searchInput.fill('001924');
    await page.waitForTimeout(600);
    await expect(page.locator('text=1HGCR2F83HA001924').first()).toBeVisible();

    // 3. Test another VIN search: 5UXCR6C05L9B83719 (BMW X5)
    await searchInput.fill('5UXCR6C05L9B83719');
    await page.waitForTimeout(600);
    await expect(page.locator('text=5UXCR6C05L9B83719').first()).toBeVisible();
    await expect(page.locator('text=BMW').first()).toBeVisible();
    await expect(page.locator('text=X5 xDrive40i').first()).toBeVisible();

    // 4. Open Vehicle details
    const viewLink = page.locator('a[href*="/vehicles/"]:has-text("Details"), a[href*="/vehicles/"]:has-text("View")').first();
    await viewLink.click();
    await expect(page).toHaveURL(/.*vehicles\/\d+/);

    // Verify vehicle details page contents
    await expect(page.locator('text=VIN').first()).toBeVisible();
    await expect(page.getByText('Assigned Yard').first()).toBeVisible();
    await expect(page.getByText('Routing Decision').first()).toBeVisible();
    await expect(page.getByText('Asset Workflow Progression')).toBeVisible();
  });

  test('5. Real-Time VIN Decoding: Displays Vehicle Name and Model upon VIN Entry', async ({ page }) => {
    await loginAs(page, 'staff@omt.com', 'Staff@123');

    // 1. Test VIN Decoding in Vehicle Registration
    await page.goto('/vehicles/new');
    await expect(page).toHaveURL(/.*vehicles\/new/);

    const vinInput = page.locator('#vehicle-vin');
    await expect(vinInput).toBeVisible();

    // Type Honda VIN
    await vinInput.fill('1HGCR2F83HA001924');
    await page.waitForTimeout(400);

    // Verify Vehicle Name and Model are prominently displayed
    await expect(page.locator('text=VIN Decoded Vehicle')).toBeVisible();
    await expect(page.locator('text=2017 Honda Accord EX-L')).toBeVisible();
    await expect(page.locator('text=Vehicle Name: Honda Accord EX-L')).toBeVisible();
    await expect(page.locator('text=Model: Accord EX-L')).toBeVisible();

    // Verify fields were auto-populated
    const makeInput = page.locator('#vehicle-make');
    const modelInput = page.locator('#vehicle-model');
    const yearInput = page.locator('#manufacture-year');

    await expect(makeInput).toHaveValue('Honda');
    await expect(modelInput).toHaveValue('Accord EX-L');
    await expect(yearInput).toHaveValue('2017');

    // Test Quick Sample button for BMW X5
    const bmwSampleBtn = page.locator('button:has-text("BMW X5")');
    await expect(bmwSampleBtn).toBeVisible();
    await bmwSampleBtn.click();
    await page.waitForTimeout(400);

    await expect(page.locator('text=2021 BMW X5 xDrive40i')).toBeVisible();
    await expect(makeInput).toHaveValue('BMW');
    await expect(modelInput).toHaveValue('X5 xDrive40i');
    await expect(yearInput).toHaveValue('2021');

    // 2. Test VIN search decoding banner in Vehicle List
    await page.goto('/vehicles');
    const searchInput = page.locator('input[placeholder*="Search by VIN"]');
    await searchInput.fill('WAUZZZ8V7FA018492');
    await page.waitForTimeout(400);

    await expect(page.locator('text=VIN Match:')).toBeVisible();
    await expect(page.locator('text=2020 Audi A3 Sportback')).toBeVisible();
  });

});
