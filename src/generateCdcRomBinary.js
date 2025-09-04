// Generate CDC ROM binary format from vectorRomCDC6602.js
// Creates a new JS file with all characters in original binary table format

import { vectorCharacterRomCDC6602 } from './archive_to_delete/vectorRomCDC6602.js';
import { convertVectorToCdcTableSimple } from './vectorToCdcTableCorrect.js';
import fs from 'fs';

/**
 * Generate visual pattern string from binary flags
 * @param {number} binary - Binary value in format 0bV1V2H1H2U
 * @returns {string} Pattern string like ".X.X."
 */
function binaryToPattern(binary) {
    const bits = [
        (binary >> 4) & 1,  // V1
        (binary >> 3) & 1,  // V2
        (binary >> 2) & 1,  // H1
        (binary >> 1) & 1,  // H2
        binary & 1          // U
    ];
    return bits.map(bit => bit ? 'X' : '.').join('');
}

/**
 * Generate octal label for stroke index
 * @param {number} index - Stroke index (0-based)
 * @returns {string} Octal label (76 for first, then 00-25)
 */
function getOctalLabel(index) {
    return index === 0 ? '76' : (index - 1).toString(8).padStart(2, '0');
}

/**
 * Convert all characters to CDC ROM binary format
 * @returns {Object} Map of character to binary arrays
 */
function convertAllCharacters() {
    const cdcRomBinary = {};
    
    // Process each character in the ROM
    for (const [char, vectorData] of Object.entries(vectorCharacterRomCDC6602)) {
        const result = convertVectorToCdcTableSimple(vectorData, char);
        
        // Convert binary strings to numbers and add formatted comments
        const binaryArray = result.binarySequence.map((binStr, index) => {
            // Parse binary string (format: "0b01010") - remove 0b prefix for parseInt
            const binValue = parseInt(binStr.replace('0b', ''), 2);
            const pattern = binaryToPattern(binValue);
            const label = getOctalLabel(index);
            
            return {
                value: binValue,
                comment: `${label} ${pattern}`
            };
        });
        
        cdcRomBinary[char] = binaryArray;
    }
    
    return cdcRomBinary;
}

/**
 * Generate JavaScript source file with CDC ROM binary data
 * @param {Object} cdcRomBinary - Map of character to binary arrays
 * @returns {string} JavaScript source code
 */
function generateSourceFile(cdcRomBinary) {
    let source = `// CDC 6602 Character ROM in Original Binary Format
// Generated from vectorRomCDC6602.js
// Format: 0bV1V2H1H2U where each bit represents a control flag
//   V1, V2: Vertical movement flags
//   H1, H2: Horizontal movement flags  
//   U: Beam toggle flag
// Comments show: timing_label visual_pattern

export const cdcRomBinary = {
`;

    // Process characters in a consistent order
    const sortedChars = Object.keys(cdcRomBinary).sort((a, b) => {
        // Numbers first, then letters, then symbols
        if (/^\d$/.test(a) && !/^\d$/.test(b)) return -1;
        if (!/^\d$/.test(a) && /^\d$/.test(b)) return 1;
        if (/^[A-Z]$/i.test(a) && !/^[A-Z]$/i.test(b)) return -1;
        if (!/^[A-Z]$/i.test(a) && /^[A-Z]$/i.test(b)) return 1;
        return a.localeCompare(b);
    });

    sortedChars.forEach((char, charIndex) => {
        const binaryArray = cdcRomBinary[char];
        
        // Escape special characters for JS object keys
        const key = char === '"' ? '\\"' : 
                   char === '\\' ? '\\\\' : 
                   char;
        
        source += `    "${key}": [\n`;
        
        binaryArray.forEach((entry, index) => {
            const binStr = '0b' + entry.value.toString(2).padStart(5, '0');
            const isLast = index === binaryArray.length - 1;
            source += `        ${binStr}${isLast ? '' : ','} // ${entry.comment}\n`;
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
`;
    
    return source;
}

// Main execution
console.log('Converting vectorRomCDC6602.js to CDC ROM binary format...\n');

const cdcRomBinary = convertAllCharacters();
const sourceCode = generateSourceFile(cdcRomBinary);

// Write to file
const outputPath = './cdcRomBinary.js';
fs.writeFileSync(outputPath, sourceCode, 'utf8');

console.log(`Generated ${outputPath} with ${Object.keys(cdcRomBinary).length} characters`);
console.log('\nCharacter set:', Object.keys(cdcRomBinary).sort().join(' '));

// Show sample output for letter 'C'
console.log('\nSample output for letter "C":');
const letterC = cdcRomBinary['C'];
if (letterC) {
    letterC.slice(0, 10).forEach(entry => {
        const binStr = '0b' + entry.value.toString(2).padStart(5, '0');
        console.log(`    ${binStr} // ${entry.comment}`);
    });
    console.log('    ...');
}