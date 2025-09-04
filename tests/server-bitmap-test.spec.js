const { test, expect } = require('@playwright/test');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple HTTP server for serving files
function createTestServer(port = 8080) {
  const server = http.createServer((req, res) => {
    let filePath = path.join(process.cwd(), req.url === '/' ? '/view_chargen_scaled.html' : req.url);
    
    // Serve JS files with correct MIME type
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.css') contentType = 'text/css';
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
  
  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

test.describe('DD60 Bitmap Verification with HTTP Server', () => {
  let server;
  
  test.beforeAll(async () => {
    server = await createTestServer(8080);
    console.log('Test server started on port 8080');
  });
  
  test.afterAll(async () => {
    server.close();
    console.log('Test server stopped');
  });

  test('verify bitmap rendering with proper module loading', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`CONSOLE ERROR: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', exception => {
      console.log(`PAGE ERROR: ${exception.message}`);
    });

    // Navigate via HTTP server
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give modules time to load
    
    // Check if character buttons were created
    const buttonCount = await page.locator('.character-button').count();
    console.log(`Character buttons found: ${buttonCount}`);
    expect(buttonCount).toBeGreaterThan(0);
    
    // Select character 'A'
    await page.click('[data-char="A"]');
    console.log('Clicked character A');
    
    // Switch to bitmap technique
    await page.click('[data-technique="bitmap"]');
    console.log('Switched to bitmap technique');
    
    await page.waitForTimeout(1000);
    
    // Extract bitmap pixel data for character 'A'
    const bitmapAnalysis = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      if (canvases.length === 0) return { error: 'No canvases found' };
      
      // Find smallest canvas (7x7 bitmap)
      let smallestCanvas = canvases[0];
      for (let canvas of canvases) {
        if (canvas.width < smallestCanvas.width) {
          smallestCanvas = canvas;
        }
      }
      
      const ctx = smallestCanvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, smallestCanvas.width, smallestCanvas.height);
      
      // Analyze pixels to create pattern
      const gridSize = 7; // Character coordinates are 0-6 (7x7)
      const pixelSize = smallestCanvas.width / gridSize;
      const pattern = [];
      
      for (let y = 0; y < gridSize; y++) {
        const row = [];
        for (let x = 0; x < gridSize; x++) {
          // Sample pixel at center of each grid cell
          const centerX = Math.floor((x + 0.5) * pixelSize);
          const centerY = Math.floor((y + 0.5) * pixelSize);
          const index = (centerY * smallestCanvas.width + centerX) * 4;
          
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          
          // Check if pixel is drawn (not white)
          const isDrawn = r < 240 && g < 240 && b < 240;
          row.push(isDrawn ? 1 : 0);
        }
        pattern.push(row);
      }
      
      return {
        canvasSize: { width: smallestCanvas.width, height: smallestCanvas.height },
        gridSize: gridSize,
        pixelSize: pixelSize,
        pattern: pattern
      };
    });
    
    if (bitmapAnalysis.error) {
      console.log(`Error: ${bitmapAnalysis.error}`);
      return;
    }
    
    console.log(`\nBitmap Analysis for Character 'A':`);
    console.log(`Canvas: ${bitmapAnalysis.canvasSize.width}x${bitmapAnalysis.canvasSize.height}, Grid: ${bitmapAnalysis.gridSize}x${bitmapAnalysis.gridSize}, Pixel size: ${bitmapAnalysis.pixelSize}`);
    console.log(`Pattern (1=drawn, 0=background):`);
    
    bitmapAnalysis.pattern.forEach((row, y) => {
      const rowStr = row.map(p => p ? '█' : '·').join('');
      console.log(`  ${y}: ${rowStr}`);
    });
    
    // Analyze symmetry of character 'A'
    const pattern = bitmapAnalysis.pattern;
    let asymmetryCount = 0;
    const asymmetryDetails = [];
    
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < Math.floor(pattern[y].length / 2); x++) {
        const leftPixel = pattern[y][x];
        const rightPixel = pattern[y][pattern[y].length - 1 - x];
        
        if (leftPixel !== rightPixel) {
          asymmetryCount++;
          asymmetryDetails.push(`Row ${y}: Left[${x}]=${leftPixel} vs Right[${pattern[y].length - 1 - x}]=${rightPixel}`);
        }
      }
    }
    
    console.log(`\nSymmetry Analysis:`);
    console.log(`Asymmetric pixel pairs: ${asymmetryCount}`);
    if (asymmetryCount > 0) {
      console.log(`Asymmetry details:`);
      asymmetryDetails.forEach(detail => console.log(`  ${detail}`));
    }
    
    // Verify that character was rendered (not empty)
    const totalPixels = pattern.flat().reduce((sum, pixel) => sum + pixel, 0);
    expect(totalPixels).toBeGreaterThan(0);
    
    // Take screenshot for visual inspection
    await page.screenshot({ path: 'test-results/bitmap-character-A.png' });
  });
});