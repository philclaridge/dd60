const { test, expect } = require('@playwright/test');

test.describe('Canvas Scale Functionality', () => {
    test('Canvas scale selector UI exists and functions', async ({ page }) => {
        await page.goto('http://localhost:8000/scaled_viewer.html');
        
        // Check that all canvas scale radio buttons exist
        const scales = ['1', '2', '4', '8'];
        for (const scale of scales) {
            const radio = await page.locator(`input[name="canvasScale"][value="${scale}"]`);
            await expect(radio).toBeVisible();
        }
        
        // Default should be scale 1
        const scale1 = await page.locator('input[name="canvasScale"][value="1"]');
        await expect(scale1).toBeChecked();
        
        // Test pattern canvas should exist
        const canvas = await page.locator('#cdcTestPattern canvas');
        await expect(canvas).toBeVisible();
        
        // Get initial canvas dimensions
        const initialWidth = await canvas.evaluate(el => el.width);
        expect(initialWidth).toBe(512);
        
        // Select scale 2
        await page.locator('input[name="canvasScale"][value="2"]').click();
        await page.waitForTimeout(100); // Wait for re-render
        
        // Canvas should now be 1024x1024
        const newCanvas = await page.locator('#cdcTestPattern canvas');
        const newWidth = await newCanvas.evaluate(el => el.width);
        expect(newWidth).toBe(1024);
        
        // Select scale 4
        await page.locator('input[name="canvasScale"][value="4"]').click();
        await page.waitForTimeout(100);
        
        const scale4Canvas = await page.locator('#cdcTestPattern canvas');
        const scale4Width = await scale4Canvas.evaluate(el => el.width);
        expect(scale4Width).toBe(2048);
        
        // Select scale 8
        await page.locator('input[name="canvasScale"][value="8"]').click();
        await page.waitForTimeout(100);
        
        const scale8Canvas = await page.locator('#cdcTestPattern canvas');
        const scale8Width = await scale8Canvas.evaluate(el => el.width);
        expect(scale8Width).toBe(4096);
    });
    
    test('Canvas scale affects comparison view rendering', async ({ page }) => {
        await page.goto('http://localhost:8000/scaled_viewer.html');
        
        // Check that comparison view updates with canvas scale
        await page.locator('input[name="canvasScale"][value="2"]').click();
        await page.waitForTimeout(100);
        
        // Check that the vector canvas in comparison view is rendered at higher resolution
        // The first canvas in visualizationContainer is the vector rendering
        const vectorCanvas = await page.locator('#visualizationContainer canvas').first();
        await expect(vectorCanvas).toBeVisible();
        
        const vectorWidth = await vectorCanvas.evaluate(el => el.width);
        expect(vectorWidth).toBe(8 * 28 * 2); // 8 grid units * 28 base scale * 2 canvas scale
        
        // Check that style width remains the same for visual consistency
        const styleWidth = await vectorCanvas.evaluate(el => el.style.width);
        expect(styleWidth).toBe('224px'); // 8 * 28 = 224px visual size
    });
    
    test('Parameter display updates with canvas scale', async ({ page }) => {
        await page.goto('http://localhost:8000/scaled_viewer.html');
        
        // Check initial display
        let paramText = await page.locator('p:has-text("Current Parameters:")').textContent();
        expect(paramText).toContain('Canvas Scale: 1 (512px)');
        
        // Change to scale 2
        await page.locator('input[name="canvasScale"][value="2"]').click();
        await page.waitForTimeout(100);
        
        paramText = await page.locator('p:has-text("Current Parameters:")').textContent();
        expect(paramText).toContain('Canvas Scale: 2 (1024px)');
        
        // Change to scale 4
        await page.locator('input[name="canvasScale"][value="4"]').click();
        await page.waitForTimeout(100);
        
        paramText = await page.locator('p:has-text("Current Parameters:")').textContent();
        expect(paramText).toContain('Canvas Scale: 4 (2048px)');
    });
});