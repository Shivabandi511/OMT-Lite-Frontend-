# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> OMT Platform End-to-End Automation Suite >> 3. Yard Management: Creation by Staff & Admin, Deactivation Restriction for Staff
- Location: tests\e2e.spec.ts:79:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Yard successfully created')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('text=Yard successfully created') with timeout 10000ms
  - waiting for locator('text=Yard successfully created')

```

```yaml
- complementary:
  - img
  - text: OMT LITE Yard & Vehicle System
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
      - img
      - text: Dashboard
    - link "Vehicles":
      - /url: /vehicles
      - img
      - text: Vehicles
    - link "Yards":
      - /url: /yards
      - img
      - text: Yards
  - link "Profile":
    - /url: /profile
    - img
    - text: Profile
  - text: OY OMT Yard Operations Staff staff@omt.com
  - button "Collapse":
    - img
    - text: Collapse
- banner:
  - text: YARDS
  - button "Toggle theme":
    - img
  - text: OY
- main:
  - text: Settings / Physical Locations
  - heading "Yards" [level=1]
  - paragraph: Physical locations where vehicles, parts and workforce are stationed
  - button "New Yard":
    - img
    - text: New Yard
  - img
  - textbox "Search by code or name..."
  - img
  - text: "Status:"
  - combobox:
    - option "All Statuses" [selected]
    - option "Active Only"
    - option "Inactive Only"
  - table:
    - rowgroup:
      - row "Yard Code Yard Name City Country Status Actions":
        - columnheader "Yard Code"
        - columnheader "Yard Name"
        - columnheader "City"
        - columnheader "Country"
        - columnheader "Status"
        - columnheader "Actions"
    - rowgroup:
      - row "YRD-0005 Eindhoven Overflow Yard Luchthavenweg 55 Eindhoven Netherlands Inactive":
        - cell "YRD-0005"
        - cell "Eindhoven Overflow Yard Luchthavenweg 55"
        - cell "Eindhoven"
        - cell "Netherlands"
        - cell "Inactive"
        - cell:
          - link "View Yard Details":
            - /url: /yards/5
            - img
          - link "Edit Yard":
            - /url: /yards/5?edit=true
            - img
      - row "YRD-0004 Hamburg South Storage (Archived) Waltershofer Damm 7 Hamburg Germany Inactive":
        - cell "YRD-0004"
        - cell "Hamburg South Storage (Archived) Waltershofer Damm 7"
        - cell "Hamburg"
        - cell "Germany"
        - cell "Inactive"
        - cell:
          - link "View Yard Details":
            - /url: /yards/4
            - img
          - link "Edit Yard":
            - /url: /yards/4?edit=true
            - img
      - row "YRD-0003 Duisburg Inland Terminal Ruhrort Hafenstrasse 15 Duisburg Germany Active":
        - cell "YRD-0003"
        - cell "Duisburg Inland Terminal Ruhrort Hafenstrasse 15"
        - cell "Duisburg"
        - cell "Germany"
        - cell "Active"
        - cell:
          - link "View Yard Details":
            - /url: /yards/3
            - img
          - link "Edit Yard":
            - /url: /yards/3?edit=true
            - img
      - row "YRD-0002 Antwerp Dismantling Center Noorderlaan 108, Haven 200 Antwerp Belgium Active":
        - cell "YRD-0002"
        - cell "Antwerp Dismantling Center Noorderlaan 108, Haven 200"
        - cell "Antwerp"
        - cell "Belgium"
        - cell "Active"
        - cell:
          - link "View Yard Details":
            - /url: /yards/2
            - img
          - link "Edit Yard":
            - /url: /yards/2?edit=true
            - img
      - row "YRD-0001 Rotterdam Central Yard Havenbedrijf 42, Maasvlakte Rotterdam Netherlands Active":
        - cell "YRD-0001"
        - cell "Rotterdam Central Yard Havenbedrijf 42, Maasvlakte"
        - cell "Rotterdam"
        - cell "Netherlands"
        - cell "Active"
        - cell:
          - link "View Yard Details":
            - /url: /yards/1
            - img
          - link "Edit Yard":
            - /url: /yards/1?edit=true
            - img
  - text: Showing 1 to 5 of 5 results 1 20 / page
  - heading "New Yard" [level=2]
  - button:
    - img
  - text: YARD CODE (AUTO)
  - textbox [disabled]: US-XX-0006
  - text: IDENTITY * Yard Name
  - textbox "e.g. Sacramento Main Yard": Staff Auto Yard 5794
  - text: "* Ownership Type"
  - combobox:
    - option "Company Owned" [selected]
    - option "Leased Location"
    - option "Partner / Third Party"
  - text: ADDRESS * Country
  - combobox:
    - option "United States" [selected]
    - option "Canada"
    - option "Nigeria"
    - option "United Kingdom"
    - option "Germany"
    - option "Netherlands"
    - option "Belgium"
  - text: "* City"
  - textbox "e.g. Sacramento": Sacramento
  - text: "* Address Line 1"
  - textbox "Street address": 8842 Logistics Blvd, Dock 4
  - text: Address Line 2 (Optional)
  - textbox "Suite, building, yard gate, etc."
  - text: Failed to create yard.
  - button "Cancel"
  - button "Create Yard":
    - text: Create Yard
    - img
```

# Test source

```ts
  3   | // Helper to login and set session
  4   | async function loginAs(page, email, password) {
  5   |   // Direct API login for quick test setup
  6   |   const response = await page.request.post('http://localhost:8080/api/auth/login', {
  7   |     data: { email, password }
  8   |   });
  9   |   expect(response.ok()).toBeTruthy();
  10  |   const data = await response.json();
  11  | 
  12  |   await page.goto('/');
  13  |   await page.evaluate(({ token, user }) => {
  14  |     localStorage.setItem('omt_token', token);
  15  |     localStorage.setItem('omt_user', JSON.stringify(user));
  16  |   }, { token: data.token, user: data.user });
  17  | }
  18  | 
  19  | test.describe('OMT Platform End-to-End Automation Suite', () => {
  20  | 
  21  |   test('1. Authentication & Profile Settings (Admin & Staff)', async ({ page }) => {
  22  |     // Login as Admin
  23  |     await loginAs(page, 'admin@omt.com', 'Admin@123');
  24  | 
  25  |     // Go to Dashboard
  26  |     await page.goto('/dashboard');
  27  |     await expect(page).toHaveURL(/.*dashboard/);
  28  | 
  29  |     // Navigate to Profile page
  30  |     await page.goto('/profile');
  31  |     await expect(page).toHaveURL(/.*profile/);
  32  | 
  33  |     // Verify Profile header elements
  34  |     await expect(page.locator('h1')).toContainText('Profile');
  35  |     await expect(page.locator('text=Manage your account settings and password')).toBeVisible();
  36  | 
  37  |     // Verify User details card
  38  |     await expect(page.locator('text=Full Name')).toBeVisible();
  39  |     await expect(page.locator('text=Email')).toBeVisible();
  40  |     await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
  41  | 
  42  |     // Verify Change Password card
  43  |     await expect(page.locator('h2:has-text("Change Password")')).toBeVisible();
  44  |     await expect(page.locator('input[placeholder="Enter current password"]')).toBeVisible();
  45  |     await expect(page.locator('input[placeholder="Uppercase, lowercase, number & symbol"]')).toBeVisible();
  46  |     await expect(page.locator('input[placeholder="Re enter new password"]')).toBeVisible();
  47  |     await expect(page.locator('button:has-text("Change Password")')).toBeVisible();
  48  | 
  49  |     // Verify Sign out button is present
  50  |     await expect(page.locator('button:has-text("Sign out")')).toBeVisible();
  51  |   });
  52  | 
  53  |   test('2. Collapsible Sidebar Functionality', async ({ page }) => {
  54  |     await loginAs(page, 'admin@omt.com', 'Admin@123');
  55  |     await page.goto('/dashboard');
  56  | 
  57  |     const aside = page.locator('aside');
  58  |     await expect(aside).toBeVisible();
  59  | 
  60  |     // Collapse toggle button
  61  |     const collapseBtn = aside.locator('button[data-tooltip*="Collapse"], button[data-tooltip*="Expand"]');
  62  |     await expect(collapseBtn).toBeVisible();
  63  | 
  64  |     // Click collapse
  65  |     await collapseBtn.click();
  66  |     await page.waitForTimeout(400);
  67  | 
  68  |     // Verify sidebar is in collapsed width (around 68px)
  69  |     const box = await aside.boundingBox();
  70  |     expect(box?.width).toBeLessThanOrEqual(75);
  71  | 
  72  |     // Click to expand again
  73  |     await collapseBtn.click();
  74  |     await page.waitForTimeout(400);
  75  |     const expandedBox = await aside.boundingBox();
  76  |     expect(expandedBox?.width).toBeGreaterThanOrEqual(230);
  77  |   });
  78  | 
  79  |   test('3. Yard Management: Creation by Staff & Admin, Deactivation Restriction for Staff', async ({ page }) => {
  80  |     // Test Staff Role: Staff CAN create yards, but CANNOT deactivate
  81  |     await loginAs(page, 'staff@omt.com', 'Staff@123');
  82  |     await page.goto('/yards');
  83  |     await expect(page).toHaveURL(/.*yards/);
  84  | 
  85  |     // Verify "+ New Yard" button is visible and usable by Staff
  86  |     const newYardBtn = page.locator('button:has-text("New Yard")');
  87  |     await expect(newYardBtn).toBeVisible();
  88  | 
  89  |     // Open New Yard modal
  90  |     await newYardBtn.click();
  91  |     await expect(page.locator('h2:has-text("New Yard")')).toBeVisible();
  92  | 
  93  |     // Fill new yard details
  94  |     const uniqueYardName = `Staff Auto Yard ${Date.now().toString().slice(-4)}`;
  95  |     await page.fill('input[placeholder="e.g. Sacramento Main Yard"]', uniqueYardName);
  96  |     await page.fill('input[placeholder="e.g. Sacramento"]', 'Sacramento');
  97  |     await page.fill('input[placeholder="Street address"]', '8842 Logistics Blvd, Dock 4');
  98  | 
  99  |     // Submit yard creation
  100 |     await page.click('button[type="submit"]:has-text("Create Yard")');
  101 | 
  102 |     // Verify success banner and yard appears in table
> 103 |     await expect(page.locator('text=Yard successfully created')).toBeVisible({ timeout: 10000 });
      |                                                                  ^ Error: expect(locator).toBeVisible() failed
  104 |     await expect(page.locator(`text=${uniqueYardName}`)).toBeVisible();
  105 | 
  106 |     // Now visit an existing yard to test Deactivation restriction for Staff
  107 |     await page.goto('/yards/1');
  108 |     await expect(page.locator('text=Yard Details').or(page.locator('text=Assigned Vehicles'))).toBeVisible();
  109 | 
  110 |     // Verify that Staff DOES NOT have a Deactivate Yard button
  111 |     await expect(page.locator('button:has-text("Deactivate Yard")')).not.toBeVisible();
  112 |     await expect(page.locator('text=Admin only')).toBeVisible();
  113 | 
  114 |     // Test Admin Role: Admin has deactivation button, but cannot deactivate if active vehicles exist
  115 |     await loginAs(page, 'admin@omt.com', 'Admin@123');
  116 |     await page.goto('/yards/1');
  117 | 
  118 |     // Yard 1 (Rotterdam) has active vehicles assigned
  119 |     await expect(page.locator('button:has-text("Deactivate Yard")')).toBeVisible();
  120 |     await page.click('button:has-text("Deactivate Yard")');
  121 | 
  122 |     // System must block deactivation because active vehicles are assigned
  123 |     await expect(
  124 |       page.locator('text=Cannot deactivate yard').or(page.locator('text=active vehicle'))
  125 |     ).toBeVisible();
  126 |   });
  127 | 
  128 |   test('4. Vehicle Asset Management & VIN Searching', async ({ page }) => {
  129 |     await loginAs(page, 'admin@omt.com', 'Admin@123');
  130 |     await page.goto('/vehicles');
  131 |     await expect(page).toHaveURL(/.*vehicles/);
  132 | 
  133 |     // 1. Search for seeded VIN: 1HGCR2F83HA001924 (Honda Accord EX-L)
  134 |     const searchInput = page.locator('input[placeholder*="Search"]');
  135 |     await expect(searchInput).toBeVisible();
  136 | 
  137 |     await searchInput.fill('1HGCR2F83HA001924');
  138 |     await page.waitForTimeout(600);
  139 | 
  140 |     // Verify the filtered result
  141 |     await expect(page.locator('text=1HGCR2F83HA001924')).toBeVisible();
  142 |     await expect(page.locator('text=Honda')).toBeVisible();
  143 |     await expect(page.locator('text=Accord EX-L')).toBeVisible();
  144 | 
  145 |     // 2. Test partial VIN search: last digits '001924'
  146 |     await searchInput.fill('001924');
  147 |     await page.waitForTimeout(600);
  148 |     await expect(page.locator('text=1HGCR2F83HA001924')).toBeVisible();
  149 | 
  150 |     // 3. Test another VIN search: 5UXCR6C05L9B83719 (BMW X5)
  151 |     await searchInput.fill('5UXCR6C05L9B83719');
  152 |     await page.waitForTimeout(600);
  153 |     await expect(page.locator('text=5UXCR6C05L9B83719')).toBeVisible();
  154 |     await expect(page.locator('text=BMW')).toBeVisible();
  155 |     await expect(page.locator('text=X5 xDrive40i')).toBeVisible();
  156 | 
  157 |     // 4. Open Vehicle details
  158 |     const viewLink = page.locator('a[href*="/vehicles/"]:has-text("View")').first();
  159 |     await viewLink.click();
  160 |     await expect(page).toHaveURL(/.*vehicles\/\d+/);
  161 | 
  162 |     // Verify vehicle details page contents
  163 |     await expect(page.locator('text=Asset Code').or(page.locator('text=AST-'))).toBeVisible();
  164 |     await expect(page.locator('text=VIN').first()).toBeVisible();
  165 |     await expect(page.locator('text=Assigned Yard').or(page.locator('text=Yard'))).toBeVisible();
  166 |     await expect(page.locator('text=Routing Decision')).toBeVisible();
  167 |     await expect(page.locator('text=Status')).toBeVisible();
  168 |   });
  169 | 
  170 | });
  171 | 
```