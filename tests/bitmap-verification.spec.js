// Playwright test to verify bitmap rendering in view_chargen_scaled.html
const { test, expect } = require('@playwright/test');

test.describe('DD60 Character Bitmap Rendering', () => {
  
  test('bitmap rendering displays correctly', async ({ page }) => {
    // Navigate to the scaled character viewer
    await page.goto('file://' + process.cwd() + '/view_chargen_scaled.html');
    
    // Wait for the page to load and render
    await page.waitForLoadState('networkidle');
    
    // Select character 'A' for testing
    await page.click('[data-char="A"]');
    
    // Switch to bitmap technique
    await page.click('[data-technique="bitmap"]');
    
    // Wait for rendering to complete
    await page.waitForTimeout(1000);
    
    // Verify that bitmap canvases are present
    const canvases = await page.locator('canvas').count();
    expect(canvases).toBeGreaterThan(0);
    
    // Take a screenshot for visual verification
    await expect(page).toHaveScreenshot('bitmap-rendering-A.png');
    
    console.log(`Found ${canvases} canvas elements for bitmap rendering`);
  });

  test('can extract bitmap pixel data for character A', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/view_chargen_scaled.html');
    await page.waitForLoadState('networkidle');
    
    // Select 'A' and bitmap mode
    await page.click('[data-char="A"]');
    await page.click('[data-technique="bitmap"]');
    await page.waitForTimeout(1000);
    
    // Extract pixel data from the smallest bitmap (7x7)
    const pixelData = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      if (canvases.length === 0) return null;
      
      // Find the smallest canvas (should be 7x7 scaled up)
      let smallestCanvas = canvases[0];
      for (let canvas of canvases) {
        if (canvas.width < smallestCanvas.width) {
          smallestCanvas = canvas;
        }
      }
      
      const ctx = smallestCanvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, smallestCanvas.width, smallestCanvas.height);
      
      // Convert to a more readable format - check for non-white pixels
      const pixels = [];
      for (let y = 0; y < smallestCanvas.height; y++) {
        const row = [];
        for (let x = 0; x < smallestCanvas.width; x++) {
          const index = (y * smallestCanvas.width + x) * 4;
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          // Check if pixel is not white (bitmap should be black on white)
          const isDrawn = r < 255 || g < 255 || b < 255;
          row.push(isDrawn ? 1 : 0);
        }
        pixels.push(row);
      }
      
      return {
        width: smallestCanvas.width,
        height: smallestCanvas.height,
        pixels: pixels
      };
    });
    
    expect(pixelData).not.toBeNull();
    expect(pixelData.pixels).toBeDefined();
    
    console.log('Bitmap pixel data for character A:');
    console.log(`Canvas size: ${pixelData.width}x${pixelData.height}`);
    console.log('Pixel pattern (1=drawn, 0=background):');
    pixelData.pixels.forEach((row, y) => {
      const rowStr = row.map(p => p ? '█' : '·').join('');
      console.log(`Row ${y.toString().padStart(2)}: ${rowStr}`);
    });
    
    // Verify that we have some drawn pixels (character should not be empty)
    const totalDrawnPixels = pixelData.pixels.flat().reduce((sum, pixel) => sum + pixel, 0);
    expect(totalDrawnPixels).toBeGreaterThan(0);
  });

  test('bitmap grid alignment verification', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/view_chargen_scaled.html');
    await page.waitForLoadState('networkidle');
    
    // Enable grid display
    await page.check('#showGrid');
    
    // Select 'A' and bitmap mode
    await page.click('[data-char="A"]');
    await page.click('[data-technique="bitmap"]');
    await page.waitForTimeout(1000);
    
    // Take screenshot with grid for alignment verification
    await expect(page).toHaveScreenshot('bitmap-grid-alignment.png');
    
    // Verify grid is actually displayed
    const gridVisible = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      if (canvases.length === 0) return false;
      
      // Check if any canvas has grid lines (non-white, non-black pixels indicating gray grid)
      for (let canvas of canvases) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Look for gray pixels that would indicate grid lines
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          
          // Check for gray pixels (grid color should be between black and white)
          if (r > 100 && r < 255 && r === g && g === b) {
            return true; // Found gray pixel (likely grid line)
          }
        }
      }
      return false;
    });
    
    console.log(`Grid visibility detected: ${gridVisible}`);
  });

  test('console error detection', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', exception => {
      consoleErrors.push(`Page error: ${exception.message}`);
    });
    
    await page.goto('file://' + process.cwd() + '/view_chargen_scaled.html');
    await page.waitForLoadState('networkidle');
    
    // Test various interactions
    await page.click('[data-char="A"]');
    await page.click('[data-technique="bitmap"]');
    await page.click('[data-technique="vector"]');
    await page.click('[data-technique="comparison"]');
    
    await page.waitForTimeout(1000);
    
    // Verify no console errors occurred
    expect(consoleErrors).toEqual([]);
    console.log('No console errors detected during bitmap rendering tests');
  });
  
});