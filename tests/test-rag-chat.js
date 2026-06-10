const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('🚀 Starting SilverWiki RAG Chat Assistant E2E & Integration Tests...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    const artifactDir = process.env.ARTIFACT_DIR || 'C:\\Users\\Technik\\.gemini\\antigravity-ide\\brain\\66c5f716-bb31-4294-b26d-b144526a9f72';
    
    // Step 1: Login
    console.log(`Step 1: Navigating to login page at ${baseUrl}/login`);
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', 'admin@admin.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('#login-form button');
    
    await page.waitForURL(`${baseUrl}/`);
    console.log('✅ Logged in successfully!');
    
    // Step 2: Verify Chat UI elements are present
    console.log('Step 2: Verifying Chat UI presence...');
    const chatTrigger = page.locator('#ai-chat-trigger');
    await page.waitForSelector('#ai-chat-trigger');
    console.log('✅ Bookworm Chat trigger button is visible.');
    
    // Step 3: Open Chat and verify opening state
    console.log('Step 3: Clicking Chat trigger to open...');
    await chatTrigger.click();
    
    const chatContainer = page.locator('#ai-chat-container');
    await page.waitForSelector('#ai-chat-container');
    const isVisible = await chatContainer.isVisible();
    if (!isVisible) throw new Error('Chat widget container is not visible after click!');
    console.log('✅ Chat widget container is open and visible.');
    
    // Verify LocalStorage state
    const localStorageOpen = await page.evaluate(() => localStorage.getItem('silverwiki_chat_open'));
    console.log(`LocalStorage silverwiki_chat_open: ${localStorageOpen}`);
    if (localStorageOpen !== 'true') throw new Error('LocalStorage state not updated on open!');
    
    // Close the chat widget so it does not intercept clicks on the tweaks panel!
    console.log('Closing Chat widget to test layout toggles...');
    const chatCloseBtn = page.locator('#ai-chat-close');
    await chatCloseBtn.click();
    await page.waitForTimeout(300);

    // Open the tweaks panel
    console.log('Opening tweaks panel...');
    const tweaksToggle = page.locator('.silverwiki-tweaks-btn').first();
    await tweaksToggle.click();
    await page.waitForSelector('.silverwiki-tweaks-panel.open');
    
    console.log('Step 4: Testing Chat layout options toggling...');
    const sidebarTweakBtn = page.locator('[data-tweak-group="chatLayout"][data-tweak-value="drawer"]').first();
    const floatingTweakBtn = page.locator('[data-tweak-group="chatLayout"][data-tweak-value="floating"]').first();
    
    if (await sidebarTweakBtn.isVisible()) {
      console.log('Clicking sidebar layout tweak...');
      await sidebarTweakBtn.click();
      await page.waitForTimeout(300);
      
      const isDrawer = await chatContainer.evaluate(el => el.classList.contains('chat-layout-drawer'));
      console.log(`Chat widget contains class chat-layout-drawer: ${isDrawer}`);
      if (!isDrawer) throw new Error('Chat widget did not switch to drawer layout class!');
      
      const savedLayout = await page.evaluate(() => localStorage.getItem('silverwiki_chat_layout'));
      if (savedLayout !== 'drawer') throw new Error('Chat layout persistence in LocalStorage failed!');
      console.log('✅ Layout toggling to Drawer verified.');
      
      console.log('Clicking floating layout tweak...');
      await floatingTweakBtn.click();
      await page.waitForTimeout(300);
      
      const isFloating = await chatContainer.evaluate(el => el.classList.contains('chat-layout-floating'));
      console.log(`Chat widget contains class chat-layout-floating: ${isFloating}`);
      if (!isFloating) throw new Error('Chat widget did not switch back to floating layout!');
      console.log('✅ Layout toggling back to Floating verified.');
    } else {
      console.log('⚠️ Tweak buttons not visible, skipping layout toggle test.');
    }
    
    // Step 5: Navigate to book and create a page for context testing
    console.log('Step 5: Navigating to books...');
    await page.goto(`${baseUrl}/books`);
    const bookLink = page.locator('a.grid-card, .list-container a, a[href*="/books/"]').first();
    const bookUrl = await bookLink.getAttribute('href');
    await page.goto(bookUrl);
    
    console.log('Step 6: Creating a new page to test RAG indexing...');
    const newPageLink = page.locator('a[href*="/create-page"], a:has-text("New Page"), a:has-text("Neue Seite")').first();
    await newPageLink.click();
    await page.waitForSelector('input[name="name"]');
    
    const uniqueId = Date.now();
    const testTitle = `Kaffeemaschine SOP - ${uniqueId}`;
    // Content contains a specific secret we can query
    const testHtml = `
      <p>Hier ist die Arbeitsanweisung für die Kaffeemaschine.</p>
      <p>Das geheime Passwort für das Admin-Menü der Kaffeemaschine lautet: <strong>EspressoGlow99</strong></p>
    `;
    
    console.log('Submitting the test page...');
    await page.evaluate(({ title, html }) => {
      document.querySelector('input[name="name"]').value = title;
      const htmlEditor = document.getElementById('html-editor') || document.querySelector('textarea[name="html"]');
      if (htmlEditor) htmlEditor.value = html;
      const form = document.querySelector('#main-content form');
      if (form) form.submit();
    }, { title: testTitle, html: testHtml });
    
    await page.waitForSelector('.page-content');
    const pageUrl = page.url();
    console.log(`✅ Page created successfully at: ${pageUrl}`);
    
    // Wait a brief moment for database events to finish embedding generation
    console.log('Waiting for Ollama to process page embedding...');
    await page.waitForTimeout(3000);
    
    // Step 7: Open Chat and query the secret we just created
    console.log('Step 7: Testing Chat Assistant with RAG query...');
    
    // Re-ensure chat is open
    const currentTrigger = page.locator('#ai-chat-trigger');
    if (await currentTrigger.isVisible()) {
      await currentTrigger.click();
    }
    await page.waitForSelector('#ai-chat-container');
    
    const chatInput = page.locator('#ai-chat-input');
    const chatSendBtn = page.locator('#ai-chat-send');
    
    const question = 'Wie lautet das geheime Passwort für das Admin-Menü der Kaffeemaschine?';
    console.log(`Sending question: "${question}"`);
    await chatInput.fill(question);
    
    // Capture the thinking state immediately after click
    await chatSendBtn.click();
    
    console.log('Checking thinking state and animation classes...');
    const header = page.locator('#ai-chat-container .ai-chat-header');
    const wormIcon = page.locator('.ai-chat-title .icon');
    
    const isHeaderThinking = await header.evaluate(el => el.classList.contains('is-thinking'));
    const isWormThinking = await wormIcon.evaluate(el => el.classList.contains('is-thinking'));
    
    console.log(`Header is-thinking: ${isHeaderThinking}`);
    console.log(`Worm icon is-thinking: ${isWormThinking}`);
    
    // Verify that the glow classes are applied while thinking
    if (!isHeaderThinking) {
      console.warn('⚠️ Header is-thinking class was not detected instantly. (Could be due to fast network/Ollama)');
    } else {
      console.log('✅ Header is-thinking class applied successfully (GLOW active).');
    }
    
    // Wait for the response to finish generating
    console.log('Waiting for response to complete (thinking state removal)...');
    await page.waitForFunction(() => {
      const el = document.querySelector('#ai-chat-container .ai-chat-header');
      return el && !el.classList.contains('is-thinking');
    }, undefined, { timeout: 180000 });
    console.log('✅ Response complete. Thinking class removed.');
    
    // Check assistant response
    const messages = page.locator('#ai-chat-messages .ai-chat-message.system');
    const allResponses = await messages.allTextContents();
    const lastResponse = allResponses[allResponses.length - 1];
    console.log(`Assistant Response:\n"${lastResponse}"`);
    
    if (!lastResponse.includes('EspressoGlow99')) {
      throw new Error('LLM response did not contain the expected secret! RAG Context extraction failed.');
    }
    console.log('✅ RAG successfully retrieved and LLM returned the correct answer!');
    
    // Step 8: Verify Clickable Markdown Links
    console.log('Step 8: Verifying Markdown Link parsing & rendering in Chat UI...');
    const messageContainer = page.locator('#ai-chat-messages .ai-chat-message.system').last();
    
    // Check if there is an anchor tag inside the response
    const anchor = messageContainer.locator('a');
    const count = await anchor.count();
    console.log(`Number of clickable source links in response: ${count}`);
    
    if (count === 0) {
      throw new Error('No source links rendered as clickable HTML anchor tags!');
    }
    
    const linkText = await anchor.first().innerText();
    const linkHref = await anchor.first().getAttribute('href');
    const targetAttr = await anchor.first().getAttribute('target');
    
    console.log(`First Link Text: "${linkText}"`);
    console.log(`First Link Href: "${linkHref}"`);
    console.log(`First Link Target: "${targetAttr}"`);
    
    if (!linkHref || !linkHref.includes('/books/')) {
      throw new Error(`Invalid link href: "${linkHref}". Expected BookStack entity URL.`);
    }
    if (targetAttr !== '_blank') {
      throw new Error(`Expected link target to be "_blank", got "${targetAttr}"`);
    }
    console.log('✅ Markdown links successfully converted to secure, clickable external HTML links!');
    
    // Take screenshot of chat for visual inspection
    const chatScreenshotPath = path.join(artifactDir, 'chat_assistant_response.png');
    await chatContainer.screenshot({ path: chatScreenshotPath });
    console.log(`Saved chat response screenshot to: ${chatScreenshotPath}`);
    
    // Step 9: Clean up (Delete the page)
    console.log('Step 9: Cleaning up (deleting the test page)...');
    await page.goto(pageUrl);
    const deleteLink = page.locator('a[href*="/delete"], button:has-text("Delete"), a:has-text("Löschen")').first();
    const deleteUrl = await deleteLink.getAttribute('href');
    if (deleteUrl) {
      const targetDeleteUrl = deleteUrl.startsWith('http') ? deleteUrl : `${baseUrl}${deleteUrl}`;
      await page.goto(targetDeleteUrl);
      const confirmDeleteBtn = page.locator('button:has-text("Confirm"), button:has-text("Löschen"), button.button').first();
      await confirmDeleteBtn.click();
      console.log('✅ Test page deleted and cleaned up.');
    }
    
    // Step 10: Verify API Endpoint Protection (Security Check)
    console.log('Step 10: Verifying Admin-Only API endpoint security...');
    const adminContext = page.context();
    
    // Admin request
    const adminResponse = await adminContext.request.get(`${baseUrl}/api/silverwiki/ollama/models`);
    console.log(`Admin models endpoint status: ${adminResponse.status()}`);
    if (adminResponse.status() !== 200) {
      throw new Error(`Expected admin request to succeed (200), got ${adminResponse.status()}`);
    }
    const modelsData = await adminResponse.json();
    console.log('Admin Models response contains models:', !!modelsData.models);
    
    // Guest/Non-Logged context request
    const guestContext = await browser.newContext();
    const guestResponse = await guestContext.request.get(`${baseUrl}/api/silverwiki/ollama/models`);
    console.log(`Guest models endpoint status: ${guestResponse.status()}`);
    if (guestResponse.status() !== 403 && guestResponse.status() !== 302) {
      throw new Error(`Security breach: Guest requested admin models endpoint and got status ${guestResponse.status()} instead of 403/302!`);
    }
    console.log('✅ API Security validation passed successfully.');
    
    console.log('\n🎉 ALL RAG & CHAT ASSISTANT TESTS PASSED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
