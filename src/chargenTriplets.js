// Character Generator Triplet Array Functions
// Converts CDC 6602 binary ROM data to triplet array format
// Triplet format: [destination_x_abs, destination_y_abs, beam_intensity]

import { binaryToVector, getCharacterBinary, getAllCharacters } from './cdcRomFunctions.js';

/**
 * Convert vector data to triplet array format
 * @param {Array} vectorData - Array of [x, y, beamBoolean] from binaryToVector
 * @returns {Array} Array of [x, y, beamIntensity] where intensity is 0 or 1
 */
export function vectorToTriplets(vectorData) {
    if (!vectorData || vectorData.length === 0) {
        return [];
    }
    
    // Convert boolean beam state to numeric (0 or 1)
    return vectorData.map(([x, y, beamOn]) => {
        const beamIntensity = beamOn ? 1 : 0;
        return [x, y, beamIntensity];
    });
}

/**
 * Generate triplet ROM for all characters
 * @returns {Object} Map of character to triplet arrays
 */
export function generateTripletRom() {
    const tripletRom = {};
    
    for (const char of getAllCharacters()) {
        const binaryData = getCharacterBinary(char);
        const vectorData = binaryToVector(binaryData);
        tripletRom[char] = vectorToTriplets(vectorData);
    }
    
    return tripletRom;
}

/**
 * Get triplet data for a specific character
 * @param {string} char - Character to retrieve
 * @returns {Array} Array of [x, y, beamIntensity] triplets
 */
export function getCharacterTriplets(char) {
    const binaryData = getCharacterBinary(char);
    const vectorData = binaryToVector(binaryData);
    return vectorToTriplets(vectorData);
}

/**
 * Filter triplets by beam intensity
 * @param {Array} triplets - Array of triplets
 * @param {number} threshold - Minimum intensity (0-1)
 * @returns {Array} Filtered triplet array
 */
export function filterByIntensity(triplets, threshold = 0.5) {
    return triplets.filter(([x, y, intensity]) => intensity >= threshold);
}

/**
 * Get character bounds from triplet data
 * @param {Array} triplets - Array of triplets
 * @returns {Object} Bounds {minX, maxX, minY, maxY}
 */
export function getCharacterBounds(triplets) {
    if (!triplets || triplets.length === 0) {
        return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const [x, y] of triplets) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    
    return { minX, maxX, minY, maxY };
}

/**
 * Find dwell points where beam stays at same position
 * @param {Array} triplets - Array of triplets
 * @returns {Array} Indices where beam dwells with beam on
 */
export function findDwellPoints(triplets) {
    const dwells = [];
    
    for (let i = 1; i < triplets.length; i++) {
        const [x, y, intensity] = triplets[i];
        const [prevX, prevY, prevIntensity] = triplets[i - 1];
        
        // Check if position unchanged and beam is on
        if (x === prevX && y === prevY && intensity > 0 && prevIntensity > 0) {
            dwells.push(i);
        }
    }
    
    return dwells;
}

/**
 * Convert triplets to stroke segments for rendering
 * @param {Array} triplets - Array of triplets
 * @returns {Array} Array of {x1, y1, x2, y2, intensity} segments
 */
export function tripletsToSegments(triplets) {
    const segments = [];
    
    // Start from implicit origin (0, 0)
    let prevX = 0, prevY = 0;
    
    for (const [x, y, intensity] of triplets) {
        segments.push({
            x1: prevX,
            y1: prevY,
            x2: x,
            y2: y,
            intensity: intensity
        });
        
        prevX = x;
        prevY = y;
    }
    
    return segments;
}

/**
 * Calculate total beam-on distance for a character
 * @param {Array} triplets - Array of triplets
 * @returns {number} Total distance with beam on
 */
export function calculateBeamOnDistance(triplets) {
    let totalDistance = 0;
    let prevX = 0, prevY = 0;
    
    for (const [x, y, intensity] of triplets) {
        if (intensity > 0) {
            const dx = x - prevX;
            const dy = y - prevY;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
        }
        prevX = x;
        prevY = y;
    }
    
    return totalDistance;
}