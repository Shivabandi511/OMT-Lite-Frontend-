import { test, expect } from '@playwright/test';
import { validatePassword, validatePasswordConfirmation } from '../src/utils/passwordValidator';

test.describe('Password Validation & Vehicle Navigation Suite', () => {

  test('Unit: Comprehensive password rule enforcement', () => {
    // 1. Empty password
    expect(validatePassword('').isValid).toBe(false);
    expect(validatePassword('').error).toContain('required');

    // 2. Spaces rejection
    expect(validatePassword('Admin 123!').isValid).toBe(false);
    expect(validatePassword('Admin 123!').error).toContain('cannot contain spaces');
    expect(validatePassword(' Admin123!').isValid).toBe(false);
    expect(validatePassword('Admin123! ').isValid).toBe(false);

    // 3. Minimum length (8 chars)
    expect(validatePassword('Abc1!').isValid).toBe(false);
    expect(validatePassword('Abc1!').error).toContain('at least 8 characters');

    // 4. Maximum length (64 chars)
    const longPass = 'A'.repeat(65) + 'a1!';
    expect(validatePassword(longPass).isValid).toBe(false);
    expect(validatePassword(longPass).error).toContain('not exceed 64 characters');

    // 5. Uppercase required
    expect(validatePassword('admin@123').isValid).toBe(false);
    expect(validatePassword('admin@123').error).toContain('uppercase');

    // 6. Lowercase required
    expect(validatePassword('ADMIN@123').isValid).toBe(false);
    expect(validatePassword('ADMIN@123').error).toContain('lowercase');

    // 7. Numbers required
    expect(validatePassword('Admin@Password').isValid).toBe(false);
    expect(validatePassword('Admin@Password').error).toContain('number');

    // 8. Special characters required
    expect(validatePassword('Admin12345').isValid).toBe(false);
    expect(validatePassword('Admin12345').error).toContain('special character');

    // 9. Weak passwords rejection
    expect(validatePassword('Password123!').isValid).toBe(false);
    expect(validatePassword('Password123!').error).toContain('too common');

    // 10. Confirmation matching
    expect(validatePasswordConfirmation('SecurePass123!', 'DifferentPass123!').isValid).toBe(false);
    expect(validatePasswordConfirmation('SecurePass123!', 'SecurePass123!').isValid).toBe(true);

    // 11. Valid strong password
    const valid = validatePassword('SuperSecure#2026');
    expect(valid.isValid).toBe(true);
    expect(valid.error).toBeUndefined();
  });

  test('UI: Registration Page with Password Visibility & Live Checklist', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('.auth-title')).toContainText('Create an Account');

    // Check show/hide toggle buttons exist for both fields
    const passInput = page.locator('#reg-password');
    const confirmInput = page.locator('#reg-confirm-password');
    await expect(passInput).toHaveAttribute('type', 'password');
    await expect(confirmInput).toHaveAttribute('type', 'password');

    // Click show password
    const showButtons = page.locator('button[title="Show password"]');
    await showButtons.first().click();
    await expect(passInput).toHaveAttribute('type', 'text');

    // Type weak password and verify checklist indicator
    await passInput.fill('Admin 123!');
    await expect(page.locator('text=Password Requirements:')).toBeVisible();
    await expect(page.locator('text=No spaces allowed')).toBeVisible();

    // Fill name, email, password with spaces, and confirm
    await page.locator('#reg-name').fill('John Doe');
    await page.locator('#reg-email').fill('john.doe@omt.com');
    await passInput.fill('Admin 123!');
    await confirmInput.fill('Admin 123!');
    await page.locator('button:has-text("Create Account")').click();
    await expect(page.locator('text=Password cannot contain spaces or whitespace.')).toBeVisible();
  });

  test('UI: Vehicle Detail Navigation & Parts Pagination', async ({ page }) => {
    // Login
    const response = await page.request.post('http://localhost:8080/api/auth/login', {
      data: { email: 'admin@omt.com', password: 'Admin@123' }
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    await page.goto('/vehicles/1');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('omt_token', token);
      localStorage.setItem('omt_user', JSON.stringify(user));
    }, { token: data.token, user: data.user });

    await page.goto('/vehicles/1');

    // Wait for initial data load
    await expect(page.locator('text=Loading vehicle asset specifications')).toHaveCount(0, { timeout: 15000 });

    // 1. Verify "Back to Vehicles" navigation button is visible
    const backBtn = page.locator('a:has-text("Back to Vehicles")');
    await expect(backBtn).toBeVisible({ timeout: 10000 });

    // 2. Verify Breadcrumb link to VEHICLES
    const breadcrumbVehiclesLink = page.locator('header a[href="/vehicles"]').first();
    await expect(breadcrumbVehiclesLink).toBeVisible();

    // 3. Verify Parts Inventory Pagination is rendered
    await expect(page.locator('text=Parts Inventory')).toBeVisible();
    await expect(page.locator('text=Showing')).toBeVisible();
    await expect(page.locator('button[title="Next Page"]')).toBeVisible();
  });
});
