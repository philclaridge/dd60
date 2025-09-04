// CDC 6602 Character ROM Functions
// Functions for working with CDC ROM binary format

import { cdcRomBinary } from './cdcRomBinary.js';

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