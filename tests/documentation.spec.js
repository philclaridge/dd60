const { test, expect } = require('@playwright/test');

test.describe('Documentation Loading', () => {
    test('documentation.html loads markdown content properly', async ({ page }) => {
        await page.goto('http://localhost:8000/documentation.html');
        
        // Wait for content to load (it starts with "Loading documentation...")
        await page.waitForFunction(() => {
            const content = document.getElementById('content');
            return content && !content.textContent.includes('Loading documentation...');
        }, { timeout: 5000 });
        
        // Check that content is no longer showing loading message
        const content = await page.locator('#content');
        const contentText = await content.textContent();
        expect(contentText).not.toContain('Loading documentation...');
        
        // Check for DD60 content (should contain heading)
        expect(contentText).toContain('DD60');
        
        // Check that table of contents was generated
        const toc = await page.locator('.toc');
        await expect(toc).toBeVisible();
        
        // Check for some expected DD60 documentation sections
        expect(contentText).toContain('Display');
        
        // Verify no error message is shown
        const errorDiv = await page.locator('.error');
        expect(await errorDiv.count()).toBe(0);
    });
    
    test('documentation.html handles CORS properly via HTTP server', async ({ page }) => {
        // This test verifies the fix works with HTTP server (no CORS issues)
        await page.goto('http://localhost:8000/documentation.html');
        
        // Should not show CORS error
        await page.waitForTimeout(2000); // Wait for fetch attempt
        
        const content = await page.locator('#content').textContent();
        expect(content).not.toContain('Could not load docs/dd60.md');
        expect(content).not.toContain('CORS restrictions');
    });
});