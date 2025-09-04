const { test, expect } = require('@playwright/test');

test('simple page load test', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
  page.on('pageerror', exception => console.log(`PAGE ERROR: ${exception.message}`));
  
  await page.goto('file://' + process.cwd() + '/view_chargen_scaled.html');
  await page.waitForLoadState('networkidle');
  
  // Check if page loaded
  const title = await page.title();
  console.log(`Page title: ${title}`);
  
  // Check if character selector exists
  const selectorExists = await page.locator('#characterSelector').count();
  console.log(`Character selector found: ${selectorExists > 0}`);
  
  // Check if buttons were created
  const buttonCount = await page.locator('.character-button').count();
  console.log(`Character buttons found: ${buttonCount}`);
  
  // Check if buttons are visible
  if (buttonCount > 0) {
    const firstButtonVisible = await page.locator('.character-button').first().isVisible();
    console.log(`First button visible: ${firstButtonVisible}`);
    
    // Get button text
    const buttonTexts = await page.locator('.character-button').allTextContents();
    console.log(`Button texts: ${buttonTexts.slice(0, 5).join(', ')}...`);
  }
  
  // Take a screenshot to see what's displayed
  await page.screenshot({ path: 'test-results/page-load.png', fullPage: true });
  console.log('Screenshot saved as page-load.png');
});