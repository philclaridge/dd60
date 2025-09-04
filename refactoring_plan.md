# Refactoring Plan: view_chargen_rom.html

## Overview
Plan to refactor `view_chargen_rom.html` into a new visualization system with:
- Reusable JavaScript modules
- New triplet array format: `(destination_x_abs, destination_y_abs, beam_intensity_from_last_location_to_dest)`
- Support for multiple rendering scales and techniques

## 1. JavaScript Functions to Extract and Refactor

### Core Character Conversion Module (`chargenConverter.js`)
Functions to extract:
```javascript
// Binary to vector conversion (already in cdcRomFunctions.js - reuse)
- binaryToVector(binaryData)

// NEW: Convert vector format to triplet array format
- vectorToTriplets(vectorData) 
  Input: Array of [x, y, beamOn] from binaryToVector
  Output: Array of [dest_x, dest_y, beam_intensity]
  Note: beam_intensity is numeric (0 or 1) not boolean
```

### Canvas Rendering Module (`chargenRenderer.js`)
Functions to extract and generalize:
```javascript
// Grid drawing utilities
- drawGrid(ctx, gridSize, scale)
  Draw coordinate grid for character visualization

// Stroke rendering with beam intensity
- renderTriplets(ctx, triplets, scale, options)
  Options: {
    showBeamOff: boolean,
    showArrowheads: boolean, 
    showDwellPoints: boolean,
    lineColors: { on: '#00ff00', off: '#b3d9ff' }
  }

// Point rendering for beam positions
- renderBeamPoints(ctx, triplets, scale)
  Draw dots at beam positions with dwell detection

// Arrowhead rendering for direction
- drawArrowhead(ctx, x1, y1, x2, y2, size, color)
  Draw directional indicators on segments
```

### Character Analysis Module (`chargenAnalysis.js`)
Functions to extract:
```javascript
// Detect beam dwells (same position, beam on)
- findDwellPoints(triplets)
  Returns indices where beam dwells

// Detect direction changes
- findDirectionChanges(binaryData)
  Returns indices with H1&H2 or V1&V2 set

// Calculate character bounds
- getCharacterBounds(triplets)
  Returns {minX, maxX, minY, maxY}
```

## 2. New Triplet Array Data Structure

### Format Definition
```javascript
// Each triplet represents a stroke endpoint
[
  destination_x_absolute,    // Absolute X coordinate (0-7)
  destination_y_absolute,    // Absolute Y coordinate (0-7)  
  beam_intensity            // 0 = beam off, 1 = beam on
]

// First triplet implicitly starts from (0, 0) with beam off
// Example for a simple line:
[
  [2, 2, 0],  // Move to (2,2) with beam off
  [4, 2, 1],  // Draw to (4,2) with beam on
  [4, 4, 1],  // Draw to (4,4) with beam on
]
```

### Conversion Function Design
```javascript
function vectorToTriplets(vectorData) {
  // Input: [[x, y, beamBoolean], ...]
  // Output: [[x, y, beamNumeric], ...]
  
  const triplets = [];
  let prevX = 0, prevY = 0;
  
  for (const [x, y, beamOn] of vectorData) {
    // Convert boolean to numeric (0/1)
    const beamIntensity = beamOn ? 1 : 0;
    
    // Store destination and beam state for stroke from prev to current
    triplets.push([x, y, beamIntensity]);
    
    prevX = x;
    prevY = y;
  }
  
  return triplets;
}
```

### Benefits of Numeric Beam Intensity
- Enables filtering: `triplets.filter(t => t[2] > threshold)`
- Future extension: Could support intermediate values (0.0-1.0) for fade effects
- Consistent with GPU shader expectations
- Simplifies mathematical operations

## 3. New Visualization File Structure

### `view_chargen_scaled.html`
Main visualization file without ROM content display:
```html
<!DOCTYPE html>
<html>
<head>
  <title>DD60 Character Visualization - Multiple Scales</title>
  <!-- Styles for different rendering modes -->
</head>
<body>
  <!-- Controls for scale, rendering options -->
  <!-- Canvas containers for different techniques -->
  
  <script type="module">
    import { generateTripletRom } from './chargenTriplets.js';
    import { renderCharacter } from './chargenRenderer.js';
    
    // Generate triplet data for all characters
    const tripletRom = generateTripletRom();
    
    // Render at multiple scales
    const scales = [7, 14, 21, 28];
    const techniques = ['vector', 'bitmap', 'sdf'];
    
    // ... rendering logic
  </script>
</body>
</html>
```

### `chargenTriplets.js`
New module for triplet generation:
```javascript
import { cdcRomBinary } from './cdcRomBinary.js';
import { binaryToVector } from './cdcRomFunctions.js';

export function vectorToTriplets(vectorData) {
  return vectorData.map(([x, y, beamOn]) => [x, y, beamOn ? 1 : 0]);
}

export function generateTripletRom() {
  const tripletRom = {};
  for (const [char, binaryData] of Object.entries(cdcRomBinary)) {
    const vectorData = binaryToVector(binaryData);
    tripletRom[char] = vectorToTriplets(vectorData);
  }
  return tripletRom;
}

export function getCharacterTriplets(char) {
  const binaryData = cdcRomBinary[char] || cdcRomBinary[' '];
  const vectorData = binaryToVector(binaryData);
  return vectorToTriplets(vectorData);
}
```

## 4. Rendering Techniques to Support

### Vector Rendering (Current)
- Draw lines between triplet points
- Scale-independent quality
- Suitable for CRT simulation

### Bitmap Rendering
- Rasterize to 1-bit at specific sizes (7×7, 14×14, 21×21, 28×28)
- Generate BDF font data
- Show pixel-perfect representation

### SDF/MSDF Rendering
- Generate signed distance fields from triplets
- High-quality scaling
- GPU-friendly for 3D engines

## 5. Implementation Steps

1. **Create `chargenTriplets.js`**
   - Implement `vectorToTriplets()` conversion
   - Add `generateTripletRom()` for full ROM
   - Include `getCharacterTriplets()` for single chars

2. **Extract rendering functions to `chargenRenderer.js`**
   - Generalize `drawCharacterGrid()` → `renderTriplets()`
   - Make colors, sizes, options configurable
   - Support different coordinate systems (Y-flip option)

3. **Create `view_chargen_scaled.html`**
   - Clone structure from `view_chargen_rom.html`
   - Remove ROM table display code
   - Add scale/technique selection controls
   - Implement side-by-side comparison views

4. **Add analysis utilities in `chargenAnalysis.js`**
   - Character metrics calculation
   - Stroke statistics
   - Optimal scale detection

## 6. Example Usage

```javascript
// Get triplets for character 'A'
const triplets = getCharacterTriplets('A');

// Filter to only beam-on strokes
const visibleStrokes = triplets.filter(t => t[2] > 0);

// Render at different scales
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

renderTriplets(ctx, triplets, 14, {
  showBeamOff: true,
  showArrowheads: true,
  lineColors: { on: '#00ff00', off: '#0066ff' }
});
```

## 7. Benefits of This Architecture

1. **Separation of Concerns**
   - Data conversion separate from rendering
   - Clean module boundaries
   - Testable components

2. **Flexibility**
   - Easy to add new rendering techniques
   - Scale-independent data format
   - Configurable visualization options

3. **Performance**
   - Triplet format is compact and efficient
   - Numeric beam values enable fast filtering
   - Pre-computed ROM reduces runtime overhead

4. **Future Extensions**
   - Can add beam intensity gradients (0.0-1.0)
   - Support for beam width/blur parameters
   - Animation of beam drawing sequence
   - Export to various font formats (BDF, PCF, etc.)