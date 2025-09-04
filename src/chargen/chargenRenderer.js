// Character Generator Rendering Functions
// Canvas-based rendering for CDC 6602 character triplet data

/**
 * Draw a coordinate grid on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} gridSize - Number of grid cells (typically 8)
 * @param {number} scale - Pixels per grid unit
 * @param {Object} options - Grid styling options
 */
export function drawGrid(ctx, gridSize = 8, scale = 20, options = {}) {
    const {
        lineWidth = 0.5,
        strokeStyle = '#999',
        showLabels = false,
        labelFont = '10px monospace',
        labelColor = '#666'
    } = options;
    
    ctx.save();
    
    // Draw grid lines
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    
    for (let i = 0; i <= gridSize; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * scale, 0);
        ctx.lineTo(i * scale, gridSize * scale);
        ctx.stroke();
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * scale);
        ctx.lineTo(gridSize * scale, i * scale);
        ctx.stroke();
    }
    
    // Draw coordinate labels if requested
    if (showLabels) {
        ctx.font = labelFont;
        ctx.fillStyle = labelColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        for (let i = 0; i < gridSize; i++) {
            // X axis labels
            ctx.fillText(i.toString(), i * scale + scale/2, gridSize * scale + 2);
            // Y axis labels (flipped for display)
            ctx.save();
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'right';
            ctx.fillText((gridSize - 1 - i).toString(), -2, i * scale + scale/2);
            ctx.restore();
        }
    }
    
    ctx.restore();
}

/**
 * Render triplet data as strokes on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} triplets - Array of [x, y, intensity] triplets
 * @param {number} scale - Pixels per coordinate unit
 * @param {Object} options - Rendering options
 */
export function renderTriplets(ctx, triplets, scale = 20, options = {}) {
    const {
        showBeamOff = true,
        showArrowheads = true,
        showDwellPoints = true,
        showOriginLine = true,
        flipY = true,
        lineColors = { on: '#00ff00', off: '#b3d9ff' },
        lineWidths = { on: 2, off: 1 },
        arrowColor = '#000000',
        arrowSize = 4,
        dwellColor = '#0066ff',
        dotRadius = 3
    } = options;
    
    ctx.save();
    
    // Track previous position (start from origin)
    let prevX = 0, prevY = 0;
    
    // Draw strokes
    for (let i = 0; i < triplets.length; i++) {
        const [x, y, intensity] = triplets[i];
        
        // Convert to canvas coordinates
        const canvasX = x * scale + scale/2;
        const canvasY = flipY ? (7 - y) * scale + scale/2 : y * scale + scale/2;
        const prevCanvasX = prevX * scale + scale/2;
        const prevCanvasY = flipY ? (7 - prevY) * scale + scale/2 : prevY * scale + scale/2;
        
        // Special case: draw line from origin to first point
        if (i === 0 && showOriginLine) {
            const originX = scale/2;
            const originY = flipY ? 7 * scale + scale/2 : scale/2;
            
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(canvasX, canvasY);
            ctx.strokeStyle = lineColors.off;
            ctx.lineWidth = lineWidths.off;
            ctx.stroke();
        }
        
        // Draw stroke from previous to current position
        if (i > 0 || !showOriginLine) {
            const shouldDraw = intensity > 0 || showBeamOff;
            
            if (shouldDraw) {
                ctx.beginPath();
                ctx.moveTo(prevCanvasX, prevCanvasY);
                ctx.lineTo(canvasX, canvasY);
                
                if (intensity > 0) {
                    ctx.strokeStyle = lineColors.on;
                    ctx.lineWidth = lineWidths.on;
                } else {
                    ctx.strokeStyle = lineColors.off;
                    ctx.lineWidth = lineWidths.off;
                }
                ctx.stroke();
            }
        }
        
        // Draw arrowheads for length-2 segments
        if (showArrowheads && i > 0) {
            const dx = x - prevX;
            const dy = y - prevY;
            
            const isLength2 = Math.abs(dx) === 2 || Math.abs(dy) === 2;
            
            if (isLength2) {
                drawArrowhead(ctx, prevCanvasX, prevCanvasY, canvasX, canvasY, 
                            arrowSize * (Math.abs(dx) === 2 && Math.abs(dy) === 2 ? 1.25 : 1), 
                            arrowColor);
            }
        }
        
        // Check for dwell points
        const isDwelling = showDwellPoints && i > 0 && 
                          x === prevX && y === prevY && 
                          intensity > 0 && triplets[i-1][2] > 0;
        
        // Draw position dots
        if (intensity > 0) {
            ctx.fillStyle = isDwelling ? dwellColor : lineColors.on;
            ctx.beginPath();
            ctx.arc(canvasX, canvasY, dotRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        prevX = x;
        prevY = y;
    }
    
    ctx.restore();
}

/**
 * Draw an arrowhead on a line segment
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x1 - Start X
 * @param {number} y1 - Start Y
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 * @param {number} size - Arrowhead size
 * @param {string} color - Arrowhead color
 */
export function drawArrowhead(ctx, x1, y1, x2, y2, size = 4, color = '#000000') {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    
    // Position arrowhead at 70% along the segment
    const arrowX = x1 + dx * 0.7;
    const arrowY = y1 + dy * 0.7;
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(arrowX, arrowY);
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size * 0.5);
    ctx.lineTo(-size, size * 0.5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

/**
 * Render character as bitmap at specific resolution
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} triplets - Array of [x, y, intensity] triplets
 * @param {number} resolution - Bitmap resolution (e.g., 7, 14, 21, 28)
 * @param {Object} options - Bitmap rendering options
 */
export function renderBitmap(ctx, triplets, resolution = 14, options = {}) {
    const {
        pixelColor = '#000000',
        backgroundColor = '#ffffff',
        showGrid = false,
        gridColor = '#cccccc'
    } = options;
    
    // Calculate pixel size (resolution / 7 for 7x7 character bounds)
    const pixelSize = resolution / 7;
    
    // Clear with background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, resolution, resolution);
    
    // Draw grid if requested
    if (showGrid) {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        // Draw 7x7 grid lines for character coordinates 0-6
        for (let i = 0; i <= 7; i++) {
            const pos = i * pixelSize;
            
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, resolution);
            ctx.stroke();
            
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(resolution, pos);
            ctx.stroke();
        }
    }
    
    // Rasterize strokes
    ctx.fillStyle = pixelColor;
    let prevX = 0, prevY = 0;
    
    for (const [x, y, intensity] of triplets) {
        if (intensity > 0) {
            // Use Bresenham's line algorithm to draw pixels
            drawBitmapLine(ctx, prevX, prevY, x, y, pixelSize);
        }
        prevX = x;
        prevY = y;
    }
}

/**
 * Draw a bitmap line using Bresenham's algorithm with proper coordinate centering
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x0 - Start X in character coordinates (0-6)
 * @param {number} y0 - Start Y in character coordinates (0-6)
 * @param {number} x1 - End X in character coordinates (0-6)
 * @param {number} y1 - End Y in character coordinates (0-6)
 * @param {number} pixelSize - Size of each pixel
 */
function drawBitmapLine(ctx, x0, y0, x1, y1, pixelSize) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    
    while (true) {
        // Convert character coordinates to pixel coordinates with centering
        // Character coordinates 0-6 map to pixel centers with 0.5 offset
        const pixelX = (x + 0.5) * pixelSize - pixelSize/2;
        const pixelY = (6 - y + 0.5) * pixelSize - pixelSize/2; // Flip Y: 6-y for 0-6 range
        
        // Draw pixel centered at the coordinate
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        
        if (x === x1 && y === y1) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}

/**
 * Create a character renderer with preset options
 * @param {Object} defaultOptions - Default rendering options
 * @returns {Function} Configured render function
 */
export function createRenderer(defaultOptions = {}) {
    return (ctx, triplets, scale, overrides = {}) => {
        const options = { ...defaultOptions, ...overrides };
        renderTriplets(ctx, triplets, scale, options);
    };
}

/**
 * Render character with CDC vector scaling
 * Scales the vector coordinates, not the bitmap pixels
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} triplets - Array of [x, y, intensity] triplets
 * @param {number} scale - Scale factor (1, 2, or 4)
 * @param {Object} options - Rendering options
 */
export function renderCDCScaledBitmap(ctx, triplets, scale = 1, options = {}) {
    const {
        pixelColor = '#000000',
        backgroundColor = '#ffffff',
        beamWidth = 1,  // Always 1 pixel wide regardless of scale
        showPixelGrid = false,
        gridColor = '#f0f0f0'
    } = options;
    
    const resolution = 7 * scale;  // 7, 14, or 28 pixels
    
    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, resolution, resolution);
    
    // Draw pixel grid if requested
    if (showPixelGrid) {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= resolution; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, resolution);
            ctx.stroke();
            
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(resolution, i);
            ctx.stroke();
        }
    }
    
    // Rasterize with scaled coordinates but 1-pixel beam
    ctx.fillStyle = pixelColor;
    let prevX = 0, prevY = 0;
    
    for (const [x, y, intensity] of triplets) {
        if (intensity > 0) {
            // Scale the coordinates, not the pixel size
            const scaledX0 = prevX * scale;
            const scaledY0 = prevY * scale;
            const scaledX1 = x * scale;
            const scaledY1 = y * scale;
            
            // Draw 1-pixel wide line at scaled coordinates
            drawCDCBitmapLine(ctx, scaledX0, scaledY0, scaledX1, scaledY1, beamWidth, scale);
        }
        prevX = x;
        prevY = y;
    }
}

/**
 * Draw a 1-pixel wide line for CDC scaled rendering
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x0 - Start X in scaled pixel coordinates
 * @param {number} y0 - Start Y in scaled pixel coordinates
 * @param {number} x1 - End X in scaled pixel coordinates
 * @param {number} y1 - End Y in scaled pixel coordinates
 * @param {number} beamWidth - Width of beam in pixels (typically 1)
 * @param {number} scale - Scale factor to determine canvas size
 */
function drawCDCBitmapLine(ctx, x0, y0, x1, y1, beamWidth, scale) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    
    while (true) {
        // Draw pixel (flip Y for display)
        // Coordinates are already scaled (0 to 6*scale)
        // For Y-flip: in scaled space, max coord is 6*scale, but we want the last pixel row
        // Since pixels are 0-indexed, coordinate 6*scale maps to pixel row (7*scale - 1)
        const pixelY = (7 * scale - 1) - y;
        ctx.fillRect(x, pixelY, beamWidth, beamWidth);
        
        if (x === x1 && y === y1) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}

/**
 * Render true-size 7x7 bitmap without any scaling
 * @param {CanvasRenderingContext2D} ctx - Canvas context  
 * @param {Array} triplets - Array of [x, y, intensity] triplets
 * @param {Object} options - Rendering options
 */
export function renderTrueSizeBitmap(ctx, triplets, options = {}) {
    const {
        pixelColor = '#000000',
        backgroundColor = '#ffffff'
    } = options;
    
    // Clear 7x7 canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, 7, 7);
    
    // Draw at actual pixel positions
    ctx.fillStyle = pixelColor;
    let prevX = 0, prevY = 0;
    
    for (const [x, y, intensity] of triplets) {
        if (intensity > 0) {
            // Direct pixel drawing without any scaling
            drawPixelLine(ctx, prevX, prevY, x, y);
        }
        prevX = x;
        prevY = y;
    }
}

/**
 * Simple pixel line drawing for true-size rendering
 */
function drawPixelLine(ctx, x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    
    while (true) {
        // Draw single pixel (flip Y: 6-y for 0-6 range)
        ctx.fillRect(x, 6 - y, 1, 1);
        
        if (x === x1 && y === y1) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}

/**
 * Render multiple characters in a grid layout
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} tripletRom - Map of character to triplet arrays
 * @param {number} scale - Pixels per coordinate unit
 * @param {Object} options - Grid layout options
 */
export function renderCharacterGrid(ctx, tripletRom, scale = 20, options = {}) {
    const {
        columns = 10,
        spacing = 1.5,
        characters = Object.keys(tripletRom),
        renderOptions = {}
    } = options;
    
    const cellSize = 8 * scale;
    const cellSpacing = cellSize * spacing;
    
    characters.forEach((char, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        ctx.save();
        ctx.translate(col * cellSpacing, row * cellSpacing);
        
        // Draw character cell background
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(0, 0, cellSize, cellSize);
        
        // Draw character
        renderTriplets(ctx, tripletRom[char], scale, renderOptions);
        
        // Draw character label
        ctx.fillStyle = '#333';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(char, cellSize / 2, cellSize + 15);
        
        ctx.restore();
    });
}