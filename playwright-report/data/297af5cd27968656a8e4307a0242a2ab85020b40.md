# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> OMT Platform End-to-End Automation Suite >> 4. Vehicle Asset Management & VIN Searching
- Location: tests\e2e.spec.ts:128:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a[href*="/vehicles/"]:has-text("View")').first()

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e4]:
    - generic "OMT Platform" [ref=f1e6] [cursor=pointer]:
      - generic [ref=f1e12]:
        - generic [ref=f1e13]: OMT LITE
        - generic [ref=f1e14]: Yard & Vehicle System
    - navigation [ref=f1e15]:
      - link "Dashboard" [ref=f1e16] [cursor=pointer]:
        - /url: /dashboard
      - link "Vehicles" [ref=f1e20] [cursor=pointer]:
        - /url: /vehicles
      - link "Yards" [ref=f1e24] [cursor=pointer]:
        - /url: /yards
      - link "Workforce Access" [ref=f1e30] [cursor=pointer]:
        - /url: /users
    - generic [ref=f1e34]:
      - link "Profile" [ref=f1e35] [cursor=pointer]:
        - /url: /profile
      - generic [ref=f1e40]:
        - generic [ref=f1e41]: OA
        - generic [ref=f1e42]:
          - generic [ref=f1e43]: OMT Administrator
          - generic [ref=f1e44]: admin@omt.com
      - button "Collapse" [ref=f1e45] [cursor=pointer]
  - generic [ref=f1e49]:
    - banner [ref=f1e50]:
      - generic [ref=f1e51]: VEHICLES
      - generic [ref=f1e54]:
        - button "Toggle theme" [ref=f1e55] [cursor=pointer]
        - generic "View Profile" [ref=f1e58] [cursor=pointer]: OA
    - main [ref=f1e59]:
      - generic [ref=f1e60]:
        - generic [ref=f1e61]:
          - generic [ref=f1e62]:
            - heading "Vehicle Asset Management" [level=1] [ref=f1e63]
            - paragraph [ref=f1e64]: Register identification, inspect routing decisions, and advance lifecycle stages
          - link "Register New Vehicle" [ref=f1e66] [cursor=pointer]:
            - /url: /vehicles/new
        - generic [ref=f1e70]:
          - textbox "Search by VIN, asset code, make, or model..." [active] [ref=f1e75]: 5UXCR6C05L9B83719
          - combobox [ref=f1e80] [cursor=pointer]:
            - option "All Yards" [selected]
            - option "YRD-0005 - Eindhoven Overflow Yard"
            - option "YRD-0004 - Hamburg South Storage (Archived)"
            - option "YRD-0003 - Duisburg Inland Terminal"
            - option "YRD-0002 - Antwerp Dismantling Center"
            - option "YRD-0001 - Rotterdam Central Yard"
          - combobox [ref=f1e84] [cursor=pointer]:
            - option "All Routing" [selected]
            - option "Dismantle"
            - option "Keep Whole"
          - combobox [ref=f1e85] [cursor=pointer]:
            - option "All Statuses" [selected]
            - option "Received"
            - option "In Progress"
            - option "Completed"
          - button "Reset" [ref=f1e86] [cursor=pointer]
        - table [ref=f1e92]:
          - rowgroup [ref=f1e93]:
            - row [ref=f1e94]:
              - columnheader "Asset Code" [ref=f1e95]
              - columnheader "VIN" [ref=f1e96]
              - columnheader "Make & Model" [ref=f1e97]
              - columnheader "Yard Location" [ref=f1e98]
              - columnheader "Routing" [ref=f1e99]
              - columnheader "Status" [ref=f1e100]
              - columnheader "Actions" [ref=f1e101]
          - rowgroup [ref=f1e102]:
            - row [ref=f1e103]:
              - cell "AST-0004" [ref=f1e104]
              - cell "5UXCR6C05L9B83719" [ref=f1e105]
              - cell "BMW X5 xDrive40i Year 2021" [ref=f1e106]:
                - generic [ref=f1e107]: BMW X5 xDrive40i
                - generic [ref=f1e108]: Year 2021
              - cell "Antwerp Dismantling Center YRD-0002" [ref=f1e109]:
                - generic [ref=f1e110]: Antwerp Dismantling Center
                - generic [ref=f1e111]: YRD-0002
              - cell "KEEP_WHOLE" [ref=f1e112]
              - cell "RECEIVED" [ref=f1e114]
              - cell [ref=f1e118]:
                - link "Details" [ref=f1e119] [cursor=pointer]:
                  - /url: /vehicles/4
```

# Test source

```ts
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
  103 |     await expect(page.locator('text=Yard successfully created')).toBeVisible({ timeout: 10000 });
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
> 159 |     await viewLink.click();
      |                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
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