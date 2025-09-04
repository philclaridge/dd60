const { test, expect } = require('@playwright/test');

test.describe('Documentation Debug', () => {
    test('check documentation loading with console logs', async ({ page }) => {
        // Listen to console messages
        page.on('console', msg => console.log('BROWSER:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
        
        await page.goto('http://localhost:8000/documentation.html');
        
        // Wait a bit and check what's happening
        await page.waitForTimeout(3000);
        
        const content = await page.locator('#content').textContent();
        console.log('Content text:', content.substring(0, 200));
        
        // Check if fetch failed
        const fetchError = await page.evaluate(() => {
            return fetch('docs/dd60.md')
                .then(response => response.text())
                .then(text => ({ success: true, textLength: text.length }))
                .catch(err => ({ success: false, error: err.message }));
        });
        console.log('Fetch test result:', fetchError);
    });
});