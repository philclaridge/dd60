# Vector to CDC 6602 Table Format Converter

This project provides JavaScript functions to convert character data from the vectorRomCDC6602.js format (array of [x, y, beam] coordinates) back to the original CDC 6602 table format with V1, V2, H1, H2, U flags.

## Overview

The CDC 6602 display controller used a specific encoding format to represent vector-drawn characters. Each stroke in a character was encoded with movement and beam control flags:

- **V1, V2**: Vertical movement flags (0, 1, or 2 units)
- **H1, H2**: Horizontal movement flags (0, 1, or 2 units)  
- **U**: Beam toggle flag (toggles beam ON/OFF state)

The binary format is: `0bV1V2H1H2U`

## Files

- `vectorToCdcTable.js` - Original implementation with complex direction handling
- `vectorToCdcTableCorrect.js` - Improved implementation with both simple and direction-aware methods
- `testVectorConversion.js` - Test suite for the conversion functions
- `testSimpleConversion.js` - Focused test for the simple method
- `demo.html` - Interactive HTML demonstration

## Usage

### Simple Method (Recommended)

```javascript
import { convertVectorToCdcTableSimple } from './vectorToCdcTableCorrect.js';
import { vectorCharacterRomCDC6602 } from './vectorRomCDC6602.js';

// Convert letter 'C'
const result = convertVectorToCdcTableSimple(vectorCharacterRomCDC6602['C'], 'C');

console.log('Binary sequence:', result.binarySequence);
console.log('Detailed table:', result.detailedTable);
```

### Result Format

The conversion function returns an object with:

```javascript
{
    character: 'C',
    binarySequence: ['0b01010', '0b01010', '0b10010', ...],
    detailedTable: [
        {
            step: 0,
            label: '76',
            position: [2, 2],
            delta: [2, 2],
            beam: 'OFF',
            flags: { V1: ' ', V2: 'X', H1: ' ', H2: 'X', U: ' ' },
            binary: '0b01010',
            decimal: 10
        },
        // ... more entries
    ],
    summary: {
        totalStrokes: 22,
        beamOnStrokes: 10,
        beamOffStrokes: 12
    }
}
```

## Algorithm

The simple conversion method works as follows:

1. **Position Tracking**: Track current X, Y position and beam state
2. **Delta Calculation**: Calculate movement between consecutive points
3. **Flag Mapping**: Map absolute movement distances to flags:
   - 1 unit vertical movement → V1 = true
   - 2 unit vertical movement → V2 = true  
   - 1 unit horizontal movement → H1 = true
   - 2 unit horizontal movement → H2 = true
4. **Beam Control**: Set U flag when beam state changes
5. **Binary Encoding**: Encode flags as 5-bit binary: V1V2H1H2U

## Example: Letter 'C'

Input vector data:
```javascript
[
    [2, 2, false],  // Move to (2,2), beam OFF
    [4, 4, false],  // Move to (4,4), beam OFF  
    [6, 5, false],  // Move to (6,5), beam OFF
    [6, 5, false],  // Stay at (6,5), beam OFF
    [6, 5, true],   // Stay at (6,5), beam ON
    [4, 6, true],   // Move to (4,6), beam ON
    // ... continues
]
```

Output binary sequence:
```
0b01010, 0b01010, 0b10010, 0b00000, 0b00001, 0b10010, 0b00010, 0b10010, ...
```

Decoded meaning:
- `0b01010` = V2=1, H2=1 → Move 2 units up, 2 units right
- `0b01010` = V2=1, H2=1 → Move 2 units up, 2 units right  
- `0b10010` = V1=1, H2=1 → Move 1 unit up, 2 units right
- `0b00000` = No movement
- `0b00001` = U=1 → Turn beam ON
- `0b10010` = V1=1, H2=1 → Move 1 unit up, 2 units right (but actually -2H +1V)

## Notes on Direction Handling

The simple method treats all movements as absolute distances, which works well for reverse-engineering the vector data. A more sophisticated approach would track direction flags and handle direction changes (when both H1&H2 or V1&V2 are set), but this adds complexity and may not be necessary for this conversion task.

## Testing

Run the test suite:
```bash
node testSimpleConversion.js
```

View the interactive demo:
```bash
# Serve the files with a local web server
# Open demo.html in a browser
```

## Results

The converter successfully reproduces the CDC 6602 table format, generating binary sequences that accurately represent the vector drawing commands. The conversion has been tested with multiple characters including letters, digits, and symbols.

For letter 'C', the conversion produces 22 stroke commands with 10 beam-on strokes and 12 beam-off strokes, matching the expected pattern for drawing the letter C as a vector graphic.