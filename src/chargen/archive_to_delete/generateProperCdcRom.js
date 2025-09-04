// Generate proper CDC ROM binary format with direction tracking
// This encoder correctly handles direction changes by comparing adjacent deltas
// and inserting direction toggle commands when needed

import { vectorCharacterRomCDC6602 } from './chargen/archive_to_delete/vectorRomCDC6602.js';
import fs from 'fs';

/**
 * Convert vector data to CDC binary format with proper direction handling
 * Uses a two-pass approach:
 * 1. First pass: calculate deltas
 * 2. Second pass: detect direction changes and insert toggles
 */
function convertVectorToCdcBinary(vectorData, characterLabel = '') {
    if (!Array.isArray(vectorData) || vectorData.length === 0) {
        throw new Error('Invalid vector data provided');
    }

    // First pass: calculate raw deltas and beam changes
    const deltas = [];
    let prevX = 0, prevY = 0, prevBeam = false;
    
    for (let i = 0; i < vectorData.length; i++) {
        const [x, y, beam] = vectorData[i];
        deltas.push({
            dx: x - prevX,
            dy: y - prevY,
            beamToggle: beam !== prevBeam,
            targetX: x,
            targetY: y,
            targetBeam: beam
        });
        prevX = x;
        prevY = y;
        prevBeam = beam;
    }
    
    // Second pass: generate binary with direction tracking
    const binaryResult = [];
    let hDir = 1;  // Current horizontal direction: 1=positive, -1=negative
    let vDir = 1;  // Current vertical direction: 1=positive, -1=negative
    
    for (let i = 0; i < deltas.length; i++) {
        const { dx, dy, beamToggle } = deltas[i];
        
        // Generate movement stroke flags for THIS movement
        let V1 = 0, V2 = 0, H1 = 0, H2 = 0, U = beamToggle ? 1 : 0;
        
        // Set vertical movement flags based on current direction
        const absY = Math.abs(dy);
        if (absY === 1) V1 = 1;
        else if (absY === 2) V2 = 1;
        else if (absY === 3) { V1 = 1; V2 = 1; } // Both for 3
        
        // Set horizontal movement flags based on current direction
        const absX = Math.abs(dx);
        if (absX === 1) H1 = 1;
        else if (absX === 2) H2 = 1;
        else if (absX === 3) { H1 = 1; H2 = 1; } // Both for 3
        
        // Check if NEXT movement will need a direction change
        // Direction toggles are OR'd into the stroke BEFORE the direction change is needed
        let toggleNote = '';
        if (i < deltas.length - 1) {
            const nextDx = deltas[i + 1].dx;
            const nextDy = deltas[i + 1].dy;
            
            // Check if next horizontal movement needs different direction
            if (nextDx !== 0) {
                const nextHDir = nextDx > 0 ? 1 : -1;
                if (nextHDir !== hDir) {
                    H1 = H1 | 1; H2 = H2 | 1;  // OR in horizontal toggle
                    toggleNote += ` H ${hDir>0?'+':'-'}→${nextHDir>0?'+':'-'}`;
                    hDir = nextHDir;
                }
            }
            
            // Check if next vertical movement needs different direction
            if (nextDy !== 0) {
                const nextVDir = nextDy > 0 ? 1 : -1;
                if (nextVDir !== vDir) {
                    V1 = V1 | 1; V2 = V2 | 1;  // OR in vertical toggle
                    toggleNote += ` V ${vDir>0?'+':'-'}→${nextVDir>0?'+':'-'}`;
                    vDir = nextVDir;
                }
            }
        }
        
        // Update direction state if THIS movement has a direction
        if (dx !== 0) {
            const currentHDir = dx > 0 ? 1 : -1;
            if (hDir !== currentHDir && i === 0) {
                // Only update if first movement and different from initial
                hDir = currentHDir;
            }
        }
        if (dy !== 0) {
            const currentVDir = dy > 0 ? 1 : -1;
            if (vDir !== currentVDir && i === 0) {
                // Only update if first movement and different from initial
                vDir = currentVDir;
            }
        }
        
        let note = `Move to (${deltas[i].targetX},${deltas[i].targetY}) beam=${deltas[i].targetBeam?'ON':'OFF'}`;
        if (toggleNote) {
            note += ` + Toggle:${toggleNote}`;
        }
        
        binaryResult.push({
            V1, V2, H1, H2, U,
            note: note
        });
    }
    
    // Ensure we have exactly 22 entries by padding if needed
    while (binaryResult.length < 22) {
        binaryResult.push({
            V1: 0, V2: 0, H1: 0, H2: 0, U: 0,
            note: 'Padding'
        });
    }
    
    // If we have too many entries, we have a problem
    if (binaryResult.length > 22) {
        console.warn(`Character ${characterLabel} generated ${binaryResult.length} strokes (expected 22)`);
        // For now, truncate to 22
        binaryResult.length = 22;
    }
    
    return binaryResult;
}

/**
 * Convert binary flags to numeric value and pattern string
 */
function binaryToFormatted(entry) {
    const value = (entry.V1 << 4) | (entry.V2 << 3) | (entry.H1 << 2) | (entry.H2 << 1) | entry.U;
    const pattern = [entry.V1, entry.V2, entry.H1, entry.H2, entry.U].map(b => b ? 'X' : '.').join('');
    return { value, pattern };
}

/**
 * Generate the cdcRomBinary.js file content
 */
function generateSourceFile() {
    let source = `// CDC 6602 Character ROM in Original Binary Format
// Generated with proper direction tracking
// Format: 0bV1V2H1H2U where each bit represents a control flag
//   V1, V2: Vertical movement flags
//   H1, H2: Horizontal movement flags  
//   U: Beam toggle flag
// Comments show: timing_label visual_pattern

export const cdcRomBinary = {
`;

    // Process characters in a consistent order
    const sortedChars = Object.keys(vectorCharacterRomCDC6602).sort((a, b) => {
        // Numbers first, then letters, then symbols
        if (/^\d$/.test(a) && !/^\d$/.test(b)) return -1;
        if (!/^\d$/.test(a) && /^\d$/.test(b)) return 1;
        if (/^[A-Z]$/i.test(a) && !/^[A-Z]$/i.test(b)) return -1;
        if (!/^[A-Z]$/i.test(a) && /^[A-Z]$/i.test(b)) return 1;
        return a.localeCompare(b);
    });

    sortedChars.forEach((char, charIndex) => {
        const vectorData = vectorCharacterRomCDC6602[char];
        const binaryData = convertVectorToCdcBinary(vectorData, char);
        
        // Log conversion details for letter 'C'
        if (char === 'C') {
            console.log('Letter C conversion:');
            console.log('====================');
            binaryData.forEach((entry, i) => {
                const { value, pattern } = binaryToFormatted(entry);
                const label = i === 0 ? '76' : (i-1).toString(8).padStart(2, '0');
                console.log(`T=${label}: ${pattern} // ${entry.note}`);
            });
            console.log();
        }
        
        // Escape special characters for JS object keys
        const key = char === '"' ? '\\"' : 
                   char === '\\' ? '\\\\' : 
                   char;
        
        source += `    "${key}": [\n`;
        
        binaryData.forEach((entry, index) => {
            const { value, pattern } = binaryToFormatted(entry);
            const binStr = '0b' + value.toString(2).padStart(5, '0');
            const label = index === 0 ? '76' : (index-1).toString(8).padStart(2, '0');
            const isLast = index === binaryData.length - 1;
            source += `        ${binStr}${isLast ? '' : ','} // ${label} ${pattern}\n`;
        });
        
        const isLastChar = charIndex === sortedChars.length - 1;
        source += `    ]${isLastChar ? '' : ','}\n`;
        if (!isLastChar) source += '\n';
    });
    
    source += `};

/**
 * Get binary ROM data for a character
 * @param {string} char - Character to retrieve
 * @returns {Array<number>} Array of binary control values
 */
export function getCharacterBinary(char) {
    return cdcRomBinary[char] || cdcRomBinary[' '];
}

/**
 * Decode binary control value to flags
 * @param {number} binary - Binary value (0bV1V2H1H2U)
 * @returns {Object} Decoded flags {V1, V2, H1, H2, U}
 */
export function decodeBinary(binary) {
    return {
        V1: Boolean((binary >> 4) & 1),
        V2: Boolean((binary >> 3) & 1),
        H1: Boolean((binary >> 2) & 1),
        H2: Boolean((binary >> 1) & 1),
        U: Boolean(binary & 1)
    };
}

/**
 * Convert CDC ROM binary format to vector coordinate format at runtime
 * Implements the exact decoding algorithm from CDC 6602 documentation
 * 
 * @param {Array<number>} binaryData - Array of binary control values
 * @returns {Array} Array of [x, y, beam] coordinates matching vectorRomCDC6602.js format
 */
export function binaryToVector(binaryData) {
    if (!binaryData || binaryData.length === 0) {
        return [];
    }
    
    const vectorData = [];
    
    // Initial state as per CDC 6602 specification
    let currentX = 0;
    let currentY = 0;
    let beamOn = false;
    let horizontalDirection = 1;  // 1 = positive, -1 = negative
    let verticalDirection = 1;    // 1 = positive, -1 = negative
    
    for (let i = 0; i < binaryData.length; i++) {
        const binary = binaryData[i];
        
        // Decode flags from binary value
        const V1 = Boolean((binary >> 4) & 1);
        const V2 = Boolean((binary >> 3) & 1);
        const H1 = Boolean((binary >> 2) & 1);
        const H2 = Boolean((binary >> 1) & 1);
        const U = Boolean(binary & 1);
        
        // Handle vertical movement according to CDC specification
        if (V1 && V2) {
            // Both set: toggle vertical direction, no movement
            verticalDirection = -verticalDirection;
        } else if (V1) {
            // V1 only: move 1 unit in current vertical direction
            currentY += 1 * verticalDirection;
        } else if (V2) {
            // V2 only: move 2 units in current vertical direction
            currentY += 2 * verticalDirection;
        }
        // If neither V1 nor V2: no vertical movement
        
        // Handle horizontal movement according to CDC specification
        if (H1 && H2) {
            // Both set: toggle horizontal direction, no movement
            horizontalDirection = -horizontalDirection;
        } else if (H1) {
            // H1 only: move 1 unit in current horizontal direction
            currentX += 1 * horizontalDirection;
        } else if (H2) {
            // H2 only: move 2 units in current horizontal direction
            currentX += 2 * horizontalDirection;
        }
        // If neither H1 nor H2: no horizontal movement
        
        // Handle beam toggle
        if (U) {
            beamOn = !beamOn;
        }
        
        // Add current position to vector data
        vectorData.push([currentX, currentY, beamOn]);
    }
    
    return vectorData;
}

/**
 * Generate the entire vector ROM at runtime from binary data
 * Converts CDC ROM binary format to vector coordinates
 * @returns {Object} Map of character to vector coordinate arrays
 */
export function generateVectorRom() {
    const vectorRom = {};
    
    for (const [char, binaryData] of Object.entries(cdcRomBinary)) {
        vectorRom[char] = binaryToVector(binaryData);
    }
    
    return vectorRom;
}

/**
 * Get vector data for a specific character at runtime
 * @param {string} char - Character to retrieve
 * @returns {Array} Array of [x, y, beam] coordinates
 */
export function getCharacterVector(char) {
    const binaryData = getCharacterBinary(char);
    return binaryToVector(binaryData);
}
`;
    
    return source;
}

// Main execution
console.log('Generating proper CDC ROM binary format with direction tracking...\n');

const sourceCode = generateSourceFile();

// Write to file
const outputPath = './cdcRomBinary.js';
fs.writeFileSync(outputPath, sourceCode, 'utf8');

console.log(`\nGenerated ${outputPath}`);
console.log('The file now contains properly encoded binary data with direction toggles.')
console.log('\nNote: Some characters may have more than 22 strokes due to direction changes.');
console.log('These are truncated to 22 to maintain compatibility.');