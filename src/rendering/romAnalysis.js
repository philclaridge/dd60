// ROM analysis visualization functions
// Extracted from inline JavaScript in view_chargen_rom.html

import { binaryToVector, getCharacterBinary } from '../cdcRomFunctions.js';

/**
 * Draw character grid with vector strokes and analysis
 * @param {Array} strokes - Array of [x, y, beam] strokes
 * @param {string} canvasId - ID of canvas element
 * @param {number} scale - Scale factor for rendering (default: 20)
 */
export function drawCharacterGrid(strokes, canvasId, scale = 20) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas '${canvasId}' not found`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(i * scale, 0);
        ctx.lineTo(i * scale, 8 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * scale);
        ctx.lineTo(8 * scale, i * scale);
        ctx.stroke();
    }
    
    // Draw character strokes
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < strokes.length; i++) {
        const [x, y, beam] = strokes[i];
        const px = x * scale + scale/2;
        const py = (7 - y) * scale + scale/2; // Flip Y axis for display
        
        if (i === 0) {
            // Draw pale blue line from implicit origin (0,0) to first point
            const originX = scale/2;
            const originY = 7 * scale + scale/2; // Origin at (0,0)
            
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(px, py);
            ctx.strokeStyle = '#b3d9ff';
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            const [prevX, prevY] = strokes[i-1];
            const ppx = prevX * scale + scale/2;
            const ppy = (7 - prevY) * scale + scale/2;
            
            ctx.beginPath();
            ctx.moveTo(ppx, ppy);
            ctx.lineTo(px, py);
            
            if (beam) {
                // Green line for beam-on strokes
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
            } else {
                // Light blue line for beam-off movements
                ctx.strokeStyle = '#b3d9ff';
                ctx.lineWidth = 1;
            }
            ctx.stroke();
            
            // Add arrowheads for length-2 movements
            drawArrowheadForLength2Movement(ctx, ppx, ppy, px, py, scale);
        }
    }
}

/**
 * Draw arrowhead for length-2 movements (horizontal, vertical, diagonal)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} ppx - Previous point X
 * @param {number} ppy - Previous point Y  
 * @param {number} px - Current point X
 * @param {number} py - Current point Y
 * @param {number} scale - Scale factor
 */
function drawArrowheadForLength2Movement(ctx, ppx, ppy, px, py, scale) {
    const dx = px - ppx;
    const dy = py - ppy;
    const gridDx = Math.abs(dx / scale);
    const gridDy = Math.abs(dy / scale);
    
    // Check for length-2 horizontal/vertical or diagonal with both deltas = 2
    const isLength2Horizontal = Math.abs(gridDx - 2) < 0.1 && Math.abs(gridDy) < 0.1;
    const isLength2Vertical = Math.abs(gridDy - 2) < 0.1 && Math.abs(gridDx) < 0.1;
    const isDiagonal2x2 = Math.abs(gridDx - 2) < 0.1 && Math.abs(gridDy - 2) < 0.1;
    
    if (isLength2Horizontal || isLength2Vertical || isDiagonal2x2) {
        ctx.fillStyle = '#000000';
        
        if (isLength2Horizontal) {
            // Horizontal line arrowhead
            const arrowX = ppx + dx * 0.7;
            const arrowY = ppy;
            const arrowSize = 4;
            const direction = dx > 0 ? 1 : -1;
            
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - direction * arrowSize, arrowY - arrowSize);
            ctx.lineTo(arrowX - direction * arrowSize, arrowY + arrowSize);
            ctx.closePath();
            ctx.fill();
        } else if (isLength2Vertical) {
            // Vertical line arrowhead
            const arrowX = ppx;
            const arrowY = ppy + dy * 0.7;
            const arrowSize = 4;
            const direction = dy > 0 ? 1 : -1;
            
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - arrowSize, arrowY - direction * arrowSize);
            ctx.lineTo(arrowX + arrowSize, arrowY - direction * arrowSize);
            ctx.closePath();
            ctx.fill();
        } else if (isDiagonal2x2) {
            // Diagonal line arrowhead
            const arrowX = ppx + dx * 0.7;
            const arrowY = ppy + dy * 0.7;
            const arrowSize = 4;
            
            // Calculate perpendicular vector for arrowhead
            const length = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / length * arrowSize;
            const perpY = dx / length * arrowSize;
            
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - dx * 0.3 + perpX, arrowY - dy * 0.3 + perpY);
            ctx.lineTo(arrowX - dx * 0.3 - perpX, arrowY - dy * 0.3 - perpY);
            ctx.closePath();
            ctx.fill();
        }
    }
}

/**
 * Generate binary table HTML for a character
 * @param {string} char - Character to analyze
 * @returns {string} HTML table string
 */
export function generateBinaryTable(char) {
    const binaryData = getCharacterBinary(char);
    if (!binaryData) return '<p>Character not found</p>';
    
    let tableHTML = `
        <h4>Character '${char}' - CDC 6602 Binary ROM Table</h4>
        <table style="border-collapse: collapse; margin: 10px 0;">
            <tr style="background: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 5px;">Row</th>
                <th style="border: 1px solid #ccc; padding: 5px;">Binary</th>
                <th style="border: 1px solid #ccc; padding: 5px;">V₁V₂H₁H₂U</th>
                <th style="border: 1px solid #ccc; padding: 5px;">Flags</th>
            </tr>
    `;
    
    // Row number mapping (from CDC documentation)
    const rowNumbers = [
        '76', '00', '01', '02', '03', '04', '05', '06', '07',
        '10', '11', '12', '13', '14', '15', '16', '17',
        '20', '21', '22', '23', '24', '25'
    ];
    
    for (let i = 0; i < binaryData.length; i++) {
        const binary = binaryData[i];
        const V1 = (binary >> 4) & 1;
        const V2 = (binary >> 3) & 1;
        const H1 = (binary >> 2) & 1;
        const H2 = (binary >> 1) & 1;
        const U = binary & 1;
        
        const flags = [];
        if (V1) flags.push('V1');
        if (V2) flags.push('V2');
        if (H1) flags.push('H1');
        if (H2) flags.push('H2');
        if (U) flags.push('U');
        
        tableHTML += `
            <tr>
                <td style="border: 1px solid #ccc; padding: 5px; font-family: monospace;">${rowNumbers[i] || i}</td>
                <td style="border: 1px solid #ccc; padding: 5px; font-family: monospace;">${binary.toString(2).padStart(5, '0')}</td>
                <td style="border: 1px solid #ccc; padding: 5px; font-family: monospace;">${V1}${V2}${H1}${H2}${U}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${flags.join(', ') || 'None'}</td>
            </tr>
        `;
    }
    
    tableHTML += '</table>';
    return tableHTML;
}

/**
 * Render complete character analysis (grid + table)
 * @param {string} char - Character to analyze  
 * @param {string} containerId - Container element ID
 * @param {Object} options - Rendering options
 * @param {number} options.scale - Grid scale (default: 20)
 * @param {boolean} options.showTable - Show binary table (default: true)
 */
export function renderCharacterAnalysis(char, containerId, options = {}) {
    const { scale = 20, showTable = true } = options;
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Analysis container '${containerId}' not found`);
        return;
    }
    
    const binaryData = getCharacterBinary(char);
    const vectorData = binaryToVector(binaryData);
    
    // Create canvas for grid
    const canvas = document.createElement('canvas');
    canvas.width = 8 * scale;
    canvas.height = 8 * scale;
    canvas.id = `analysis-canvas-${char}`;
    
    // Create section for this character
    const section = document.createElement('div');
    section.style.marginBottom = '30px';
    section.innerHTML = `<h3>Character: ${char}</h3>`;
    section.appendChild(canvas);
    
    if (showTable) {
        section.innerHTML += generateBinaryTable(char);
    }
    
    container.appendChild(section);
    
    // Draw the grid
    drawCharacterGrid(vectorData, canvas.id, scale);
}