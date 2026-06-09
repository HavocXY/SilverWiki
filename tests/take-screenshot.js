const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('📸 Starting SilverWiki Interactive Table Screenshot Capture...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    const baseUrl = 'http://localhost:8080';
    const artifactDir = 'C:\\Users\\Technik\\.gemini\\antigravity-ide\\brain\\dbba0044-0bb4-4052-8316-396479af3744';
    
    // Login
    console.log('Logging in...');
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', 'admin@admin.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('#login-form button');
    await page.waitForURL(`${baseUrl}/`);
    
    // Navigate to book to create a page
    console.log('Navigating to book...');
    await page.goto(`${baseUrl}/books`);
    const bookLink = page.locator('a.grid-card, .list-container a, a[href*="/books/"]').first();
    const bookUrl = await bookLink.getAttribute('href');
    await page.goto(bookUrl);
    
    // Create new page
    console.log('Creating page...');
    const newPageLink = page.locator('a[href*="/create-page"], a:has-text("New Page"), a:has-text("Neue Seite")').first();
    await newPageLink.click();
    await page.waitForSelector('input[name="name"]');
    
    const testTitle = `Visual Table Check Page - ${Date.now()}`;
    await page.fill('input[name="name"]', testTitle);
    
    // HTML with 5 rows to trigger full interactive controls (search & pagination)
    const testTableHtml = `
      <p>Hier ist eine sortierbare Tabelle mit modernem Gemini Design:</p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Wert (m)</th>
            <th>Material</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Geländer Alpha</td>
            <td>1.20</td>
            <td>Stahl</td>
          </tr>
          <tr>
            <td>Geländer Gamma</td>
            <td>0.90</td>
            <td>Holz</td>
          </tr>
          <tr>
            <td>Geländer Beta</td>
            <td>1.50</td>
            <td>Glas</td>
          </tr>
          <tr>
            <td>Geländer Delta</td>
            <td>1.10</td>
            <td>Aluminium</td>
          </tr>
          <tr>
            <td>Geländer Epsilon</td>
            <td>1.35</td>
            <td>Kunststoff</td>
          </tr>
        </tbody>
      </table>
    `;
    
    console.log('Submitting page...');
    await page.evaluate(({ title, html }) => {
      document.querySelector('input[name="name"]').value = title;
      const htmlEditor = document.getElementById('html-editor') || document.querySelector('textarea[name="html"]');
      if (htmlEditor) htmlEditor.value = html;
      const form = document.querySelector('#main-content form');
      if (form) form.submit();
    }, { title: testTitle, html: testTableHtml });
    
    // Wait for the view page to load
    await page.waitForSelector('.page-content');
    
    // Wait for simple-datatables to load and render
    console.log('Waiting for table initialization...');
    await page.waitForSelector('.datatable-wrapper', { timeout: 10000 });
    await page.waitForTimeout(1000); // Wait for fonts and CSS transitions
    
    // Detect current theme (dark or light)
    const isCurrentlyDark = await page.evaluate(() => document.documentElement.classList.contains('dark-mode'));
    console.log(`Current active theme detected: ${isCurrentlyDark ? 'Dark Mode' : 'Light Mode'}`);
    
    const contentArea = page.locator('main.card').first();
    const lightPath = path.join(artifactDir, 'table_view_light.png');
    const darkPath = path.join(artifactDir, 'table_view_dark.png');
    
    if (isCurrentlyDark) {
      // 1. Take Dark Mode screenshot first
      console.log('Saving dark mode screenshot...');
      await contentArea.screenshot({ path: darkPath });
      
      // 2. Toggle to Light Mode
      console.log('Toggling to light mode...');
      await page.click('.silverwiki-tweaks-btn');
      await page.waitForSelector('.silverwiki-tweaks-panel.open');
      await Promise.all([
        page.waitForNavigation(),
        page.click('[data-tweak-group="theme"][data-tweak-value="light"]')
      ]);
      
      // Wait for table on reloaded page
      await page.waitForSelector('.datatable-wrapper', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      // 3. Take Light Mode screenshot
      console.log('Saving light mode screenshot...');
      const contentAreaLight = page.locator('main.card').first();
      await contentAreaLight.screenshot({ path: lightPath });
      
      // 4. Restore Dark Mode
      console.log('Restoring dark mode...');
      await page.click('.silverwiki-tweaks-btn');
      await page.waitForSelector('.silverwiki-tweaks-panel.open');
      await Promise.all([
        page.waitForNavigation(),
        page.click('[data-tweak-group="theme"][data-tweak-value="dark"]')
      ]);
    } else {
      // 1. Take Light Mode screenshot first
      console.log('Saving light mode screenshot...');
      await contentArea.screenshot({ path: lightPath });
      
      // 2. Toggle to Dark Mode
      console.log('Toggling to dark mode...');
      await page.click('.silverwiki-tweaks-btn');
      await page.waitForSelector('.silverwiki-tweaks-panel.open');
      await Promise.all([
        page.waitForNavigation(),
        page.click('[data-tweak-group="theme"][data-tweak-value="dark"]')
      ]);
      
      // Wait for table on reloaded page
      await page.waitForSelector('.datatable-wrapper', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      // 3. Take Dark Mode screenshot
      console.log('Saving dark mode screenshot...');
      const contentAreaDark = page.locator('main.card').first();
      await contentAreaDark.screenshot({ path: darkPath });
      
      // 4. Restore Light Mode
      console.log('Restoring light mode...');
      await page.click('.silverwiki-tweaks-btn');
      await page.waitForSelector('.silverwiki-tweaks-panel.open');
      await Promise.all([
        page.waitForNavigation(),
        page.click('[data-tweak-group="theme"][data-tweak-value="light"]')
      ]);
    }
    
    // Wait for the reloaded page
    await page.waitForSelector('.page-content');
    
    // Clean up: delete page
    console.log('Deleting test page...');
    const deleteLink = page.locator('a[href*="/delete"], button:has-text("Delete"), a:has-text("Löschen")').first();
    const deleteUrl = await deleteLink.getAttribute('href');
    if (deleteUrl) {
      const targetDeleteUrl = deleteUrl.startsWith('http') ? deleteUrl : `${baseUrl}${deleteUrl}`;
      await page.goto(targetDeleteUrl);
      const confirmDeleteBtn = page.locator('button:has-text("Confirm"), button:has-text("Löschen"), button.button').first();
      await confirmDeleteBtn.click();
      console.log('✅ Visual check test page deleted.');
    }
    
    console.log('📸 Screenshot capture completed successfully!');
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error);
  } finally {
    await browser.close();
  }
})();
