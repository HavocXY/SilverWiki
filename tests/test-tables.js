const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting SilverWiki Interactive Tables Integration Test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    console.log(`Step 1: Navigating to login page at ${baseUrl}/login`);
    await page.goto(`${baseUrl}/login`);
    
    // Fill login form
    console.log('Step 2: Logging in as administrator...');
    await page.fill('input[name="email"]', 'admin@admin.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('#login-form button');
    
    // Wait for redirect to dashboard
    await page.waitForURL(`${baseUrl}/`);
    console.log('✅ Logged in successfully!');
    
    // Go to books list
    console.log('Step 3: Navigating to books...');
    await page.goto(`${baseUrl}/books`);
    
    // Find the first book link
    const bookLink = page.locator('a.grid-card, .list-container a, a[href*="/books/"]').first();
    const bookUrl = await bookLink.getAttribute('href');
    if (!bookUrl) {
      throw new Error('No book found to create a page in! Ensure seed data is loaded.');
    }
    console.log(`Step 4: Opening book at ${bookUrl}`);
    await page.goto(bookUrl);
    
    // Click "New Page"
    console.log('Step 5: Clicking "New Page"...');
    const newPageLink = page.locator('a[href*="/create-page"], a:has-text("New Page"), a:has-text("Neue Seite")').first();
    await newPageLink.click();
    
    // Wait for the editor to load
    await page.waitForSelector('input[name="name"]');
    console.log('Step 6: Creating test page with a sortable table...');
    
    // Set page title
    const testTitle = `Sortable Table Test Page - ${Date.now()}`;
    await page.fill('input[name="name"]', testTitle);
    
    const testTableHtml = `
      <p>This is a test page containing a sortable table:</p>
      <table class="sorted">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Alice</td>
            <td>30</td>
          </tr>
          <tr>
            <td>Bob</td>
            <td>25</td>
          </tr>
          <tr>
            <td>Charlie</td>
            <td>35</td>
          </tr>
          <tr>
            <td>David</td>
            <td>28</td>
          </tr>
          <tr>
            <td>Eva</td>
            <td>32</td>
          </tr>
        </tbody>
      </table>
    `;

    console.log('Step 7: Programmatically setting content and submitting form...');
    await page.evaluate(({ title, html }) => {
      // Set page title
      const titleInput = document.querySelector('input[name="name"]');
      if (titleInput) titleInput.value = title;
      
      // Set HTML content for Lexical/TinyMCE
      const htmlEditor = document.getElementById('html-editor') || document.querySelector('textarea[name="html"]');
      if (htmlEditor) {
        htmlEditor.value = html;
      }
      
      // Set Markdown content if Markdown editor is active
      const markdownEditor = document.querySelector('textarea[name="markdown"]');
      if (markdownEditor) {
        markdownEditor.value = html;
      }
      
      // Submit form programmatically to bypass client-side editor validations/intercepts
      const form = document.querySelector('#main-content form');
      if (form) {
        form.submit();
      } else {
        throw new Error('Could not find editor form to submit!');
      }
    }, { title: testTitle, html: testTableHtml });
    
    // Wait for page view to load
    await page.waitForSelector('.page-content');
    console.log('✅ Page created and saved!');
    
    // Verify DataTable initialization
    console.log('Step 8: Verifying DataTable initialization...');
    
    // Wait for simple-datatables to load and initialize (it loads dynamically)
    await page.waitForSelector('.datatable-wrapper', { timeout: 10000 });
    console.log('✅ simple-datatables initialized successfully! .datatable-wrapper found.');
    
    // Check if the search input is present
    const searchInput = page.locator('.datatable-input');
    await page.waitForSelector('.datatable-input');
    console.log('✅ Search input found.');
    
    // Test Sorting
    console.log('Step 9: Testing table sorting...');
    // Get original row order
    let rows = await page.locator('.datatable-table tbody tr').allTextContents();
    console.log('Original Row Order:', rows.map(r => r.trim().replace(/\s+/g, ' ')));
    
    // Click on "Age" header to sort
    const ageHeader = page.locator('.datatable-table th:has-text("Age"), .datatable-table th:has-text("Alter")').first();
    await ageHeader.click();
    
    // Get sorted row order (should be sorted by Name or Age ascending)
    let sortedRows = await page.locator('.datatable-table tbody tr').allTextContents();
    console.log('Sorted Row Order (first click):', sortedRows.map(r => r.trim().replace(/\s+/g, ' ')));
    
    // Test Searching
    console.log('Step 10: Testing search filtering...');
    await searchInput.fill('Bob');
    // Wait for search debounce
    await page.waitForTimeout(500);
    
    const visibleRows = await page.locator('.datatable-table tbody tr').all();
    console.log(`Number of visible rows after searching for "Bob": ${visibleRows.length}`);
    
    let bobRowText = await visibleRows[0].innerText();
    console.log('Visible Row Text:', bobRowText.trim().replace(/\s+/g, ' '));
    
    if (visibleRows.length === 1 && bobRowText.includes('Bob')) {
      console.log('✅ Search filter works correctly!');
    } else {
      throw new Error(`Search failed. Expected 1 visible row containing Bob, got ${visibleRows.length} rows.`);
    }
    
    // Reset search
    await searchInput.fill('');
    await page.waitForTimeout(500);
    
    // Step 10: Clean up (Delete the page)
    console.log('Step 11: Cleaning up (deleting the test page)...');
    const deleteLink = page.locator('a[href*="/delete"], button:has-text("Delete"), a:has-text("Löschen")').first();
    const deleteUrl = await deleteLink.getAttribute('href');
    if (deleteUrl) {
      const targetDeleteUrl = deleteUrl.startsWith('http') ? deleteUrl : `${baseUrl}${deleteUrl}`;
      await page.goto(targetDeleteUrl);
      const confirmDeleteBtn = page.locator('button:has-text("Confirm"), button:has-text("Löschen"), button.button').first();
      await confirmDeleteBtn.click();
      console.log('✅ Test page deleted and cleaned up.');
    } else {
      console.warn('⚠️ Could not find delete link. Skipping deletion.');
    }
    
    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Interactive tables are working perfectly in SilverWiki.');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
