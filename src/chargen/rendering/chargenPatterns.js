// Test pattern rendering functions
// Extracted from inline JavaScript in HTML files

import { generateTripletRom } from '../chargenTriplets.js';
import { renderTrueSizeBitmap, renderCDCScaledBitmap } from '../chargenRenderer.js';

/**
 * Render CDC 6600 test pattern showing all characters at multiple scales
 * @param {string} containerId - ID of container element
 * @param {Object} options - Rendering options
 * @param {Array} options.scales - Array of scales to render [1, 2, 4]
 * @param {string} options.pixelColor - Color for pixels (default: '#00ff00')
 * @param {string} options.backgroundColor - Background color (default: '#000')
 * @param {string} options.charOrder - Character order string
 */
export function renderCDCTestPattern(containerId, options = {}) {
    const {
        scales = [1, 2, 4],
        pixelColor = '#00ff00',
        backgroundColor = '#000',
        charOrder = '0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ+-*/()=,.'
    } = options;
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Test pattern container '${containerId}' not found`);
        return;
    }
    
    container.innerHTML = '';
    
    const panel = document.createElement('div');
    panel.className = 'render-panel';
    panel.innerHTML = '<h3>CDC 6600 Display Test Pattern - 512×512 pixels</h3>';
    
    // Create 512x512 test canvas with all characters
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 512;
    testCanvas.height = 512;
    testCanvas.style.border = '1px solid #000';
    testCanvas.style.imageRendering = 'pixelated';
    const ctx = testCanvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, 512, 512);
    
    const tripletRom = generateTripletRom();
    const availableChars = charOrder.split('').filter(c => tripletRom[c]);
    
    // Render each scale in its section
    const sectionYPositions = [15, 45, 295]; // Top, middle, bottom sections
    
    scales.forEach((scale, scaleIndex) => {
        if (scaleIndex >= sectionYPositions.length) return;
        
        ctx.save();
        ctx.translate(10, sectionYPositions[scaleIndex]);
        
        let x = 0, y = 0;
        const charWidth = 7 * scale + 3; // Character width + spacing
        const charHeight = 7 * scale + 3; // Character height + spacing
        const maxCols = Math.floor(492 / charWidth);
        
        availableChars.forEach((char, i) => {
            if (i > 0 && i % maxCols === 0) {
                x = 0;
                y += charHeight;
            }
            
            ctx.save();
            ctx.translate(x, y);
            
            if (scale === 1) {
                renderTrueSizeBitmap(ctx, tripletRom[char], {
                    pixelColor,
                    backgroundColor: 'transparent'
                });
            } else {
                renderCDCScaledBitmap(ctx, tripletRom[char], scale, {
                    pixelColor,
                    backgroundColor: 'transparent',
                    showPixelGrid: false
                });
            }
            
            ctx.restore();
            x += charWidth;
        });
        
        ctx.restore();
    });
    
    // Add labels
    ctx.fillStyle = pixelColor;
    ctx.font = '10px monospace';
    scales.forEach((scale, i) => {
        if (i < sectionYPositions.length) {
            const pixelSize = 7 * scale;
            ctx.fillText(`${scale}× (${pixelSize}×${pixelSize} pixels) - All Characters`, 10, sectionYPositions[i] - 5);
        }
    });
    
    const wrapper = document.createElement('div');
    wrapper.className = 'canvas-wrapper';
    wrapper.appendChild(testCanvas);
    
    const label = document.createElement('div');
    label.innerHTML = `
        <span style="color: #666">All characters at ${scales.join('×, ')}× vector scaling. Note: Beam width remains 1 pixel at all scales</span>
    `;
    label.style.textAlign = 'center';
    label.style.marginTop = '10px';
    wrapper.appendChild(label);
    
    panel.appendChild(wrapper);
    container.appendChild(panel);
}

/**
 * Render comparison view showing vector vs bitmap rendering
 * @param {string} containerId - ID of container element
 * @param {string} character - Character to display
 * @param {Object} renderingOptions - Rendering options from controls
 * @param {number} comparisonScale - Scale for comparison (default: 28)
 */
export function renderComparison(containerId, character, renderingOptions = {}, comparisonScale = 28) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Comparison container '${containerId}' not found`);
        return;
    }
    
    container.innerHTML = '<h3>Vector vs CDC Scaled Bitmap Comparison</h3>';
    
    const tripletRom = generateTripletRom();
    const triplets = tripletRom[character];
    
    if (!triplets) {
        container.innerHTML += '<p>Character not found</p>';
        return;
    }
    
    // This would need to be implemented with the full comparison logic
    // from the original inline function
    container.innerHTML += `<p>Comparison for character '${character}' would be rendered here</p>`;
}