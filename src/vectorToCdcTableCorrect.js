// Vector ROM CDC6602 to Original Table Format Converter (Corrected Version)
// Converts [x, y, beam] coordinate format back to CDC 6602 V1, V2, H1, H2, U flag format
// Properly handles direction flags and direction changes

/**
 * Converts character data from vectorRomCDC6602.js format back to original CDC 6602 table format
 * Implements proper direction flag handling as described in CDC 6602 documentation
 * @param {Array} vectorData - Array of [x, y, beam] coordinates
 * @param {string} characterLabel - Character label for display purposes
 * @returns {Object} Object containing binary table and detailed breakdown
 */
export function convertVectorToCdcTableCorrect(vectorData, characterLabel = '') {
    if (!Array.isArray(vectorData) || vectorData.length === 0) {
        throw new Error('Invalid vector data provided');
    }

    const result = {
        character: characterLabel,
        binarySequence: [],
        detailedTable: [],
        summary: {
            totalStrokes: vectorData.length,
            beamOnStrokes: 0,
            beamOffStrokes: 0,
            directionToggles: 0
        }
    };

    // Track current state - directions start positive
    let currentX = 0;
    let currentY = 0;
    let currentBeam = false;
    let horizontalDirection = 1; // 1 = positive, -1 = negative
    let verticalDirection = 1;   // 1 = positive, -1 = negative

    for (let i = 0; i < vectorData.length; i++) {
        const [nextX, nextY, nextBeam] = vectorData[i];
        
        // Calculate deltas
        const deltaX = nextX - currentX;
        const deltaY = nextY - currentY;
        const beamToggle = nextBeam !== currentBeam;
        
        // Determine movement flags
        let V1 = false, V2 = false, H1 = false, H2 = false, U = false;
        
        // Handle vertical movement with direction
        const absVerticalMove = Math.abs(deltaY);
        if (absVerticalMove > 0) {
            const expectedDirection = deltaY > 0 ? 1 : -1;
            
            if (expectedDirection === verticalDirection) {
                // Movement in current direction
                if (absVerticalMove === 1) {
                    V1 = true;
                } else if (absVerticalMove === 2) {
                    V2 = true;
                }
            } else {
                // Need to change direction first - this stroke toggles direction only
                V1 = true;
                V2 = true;
                verticalDirection = -verticalDirection;
                result.summary.directionToggles++;
                
                // Note: The actual movement would happen in subsequent stroke(s)
                // This is a limitation of trying to reverse-engineer the encoding
            }
        }
        
        // Handle horizontal movement with direction  
        const absHorizontalMove = Math.abs(deltaX);
        if (absHorizontalMove > 0) {
            const expectedDirection = deltaX > 0 ? 1 : -1;
            
            if (expectedDirection === horizontalDirection) {
                // Movement in current direction
                if (absHorizontalMove === 1) {
                    H1 = true;
                } else if (absHorizontalMove === 2) {
                    H2 = true;
                }
            } else {
                // Need to change direction first - this stroke toggles direction only
                H1 = true;
                H2 = true;
                horizontalDirection = -horizontalDirection;
                result.summary.directionToggles++;
                
                // Note: The actual movement would happen in subsequent stroke(s)
            }
        }
        
        // Handle beam state change
        if (beamToggle) {
            U = true;
        }
        
        // Create binary representation: 0bV1V2H1H2U
        const V1_bit = V1 ? 1 : 0;
        const V2_bit = V2 ? 1 : 0;
        const H1_bit = H1 ? 1 : 0;
        const H2_bit = H2 ? 1 : 0;
        const U_bit = U ? 1 : 0;
        
        const binaryValue = (V1_bit << 4) | (V2_bit << 3) | (H1_bit << 2) | (H2_bit << 1) | U_bit;
        const binaryString = `0b${binaryValue.toString(2).padStart(5, '0')}`;
        
        // Create detailed table entry
        const tableEntry = {
            step: i,
            label: i === 0 ? '76' : (i - 1).toString(8).padStart(2, '0'),
            position: [nextX, nextY],
            delta: [deltaX, deltaY],
            beam: nextBeam ? 'ON' : 'OFF',
            directions: `H${horizontalDirection > 0 ? '+' : '-'} V${verticalDirection > 0 ? '+' : '-'}`,
            flags: {
                V1: V1 ? 'X' : ' ',
                V2: V2 ? 'X' : ' ',
                H1: H1 ? 'X' : ' ',
                H2: H2 ? 'X' : ' ',
                U: U ? 'X' : ' '
            },
            binary: binaryString,
            decimal: binaryValue,
            notes: ''
        };
        
        // Add notes for special cases
        if (V1 && V2) {
            tableEntry.notes += 'V-dir-toggle ';
        }
        if (H1 && H2) {
            tableEntry.notes += 'H-dir-toggle ';
        }
        
        result.binarySequence.push(binaryString);
        result.detailedTable.push(tableEntry);
        
        // Update statistics
        if (nextBeam) {
            result.summary.beamOnStrokes++;
        } else {
            result.summary.beamOffStrokes++;
        }
        
        // Update current position and beam state
        currentX = nextX;
        currentY = nextY;
        currentBeam = nextBeam;
    }
    
    return result;
}

/**
 * Alternative simpler approach - just map absolute movements to flags
 * This may be more accurate for reverse engineering the original table
 * @param {Array} vectorData - Array of [x, y, beam] coordinates
 * @param {string} characterLabel - Character label for display purposes
 * @returns {Object} Object containing binary table and detailed breakdown
 */
export function convertVectorToCdcTableSimple(vectorData, characterLabel = '') {
    if (!Array.isArray(vectorData) || vectorData.length === 0) {
        throw new Error('Invalid vector data provided');
    }

    const result = {
        character: characterLabel,
        binarySequence: [],
        detailedTable: [],
        summary: {
            totalStrokes: vectorData.length,
            beamOnStrokes: 0,
            beamOffStrokes: 0
        }
    };

    // Track current state
    let currentX = 0;
    let currentY = 0;
    let currentBeam = false;

    for (let i = 0; i < vectorData.length; i++) {
        const [nextX, nextY, nextBeam] = vectorData[i];
        
        // Calculate deltas
        const deltaX = nextX - currentX;
        const deltaY = nextY - currentY;
        const beamToggle = nextBeam !== currentBeam;
        
        // Simple mapping: absolute movement magnitude maps to flags regardless of direction
        let V1 = false, V2 = false, H1 = false, H2 = false, U = false;
        
        // Vertical movement
        const absVerticalMove = Math.abs(deltaY);
        if (absVerticalMove === 1) {
            V1 = true;
        } else if (absVerticalMove === 2) {
            V2 = true;
        }
        
        // Horizontal movement  
        const absHorizontalMove = Math.abs(deltaX);
        if (absHorizontalMove === 1) {
            H1 = true;
        } else if (absHorizontalMove === 2) {
            H2 = true;
        }
        
        // Handle beam state change
        if (beamToggle) {
            U = true;
        }
        
        // Create binary representation: 0bV1V2H1H2U
        const V1_bit = V1 ? 1 : 0;
        const V2_bit = V2 ? 1 : 0;
        const H1_bit = H1 ? 1 : 0;
        const H2_bit = H2 ? 1 : 0;
        const U_bit = U ? 1 : 0;
        
        const binaryValue = (V1_bit << 4) | (V2_bit << 3) | (H1_bit << 2) | (H2_bit << 1) | U_bit;
        const binaryString = `0b${binaryValue.toString(2).padStart(5, '0')}`;
        
        // Create detailed table entry
        const tableEntry = {
            step: i,
            label: i === 0 ? '76' : (i - 1).toString(8).padStart(2, '0'),
            position: [nextX, nextY],
            delta: [deltaX, deltaY],
            beam: nextBeam ? 'ON' : 'OFF',
            flags: {
                V1: V1 ? 'X' : ' ',
                V2: V2 ? 'X' : ' ',
                H1: H1 ? 'X' : ' ',
                H2: H2 ? 'X' : ' ',
                U: U ? 'X' : ' '
            },
            binary: binaryString,
            decimal: binaryValue
        };
        
        result.binarySequence.push(binaryString);
        result.detailedTable.push(tableEntry);
        
        // Update statistics
        if (nextBeam) {
            result.summary.beamOnStrokes++;
        } else {
            result.summary.beamOffStrokes++;
        }
        
        // Update current position and beam state
        currentX = nextX;
        currentY = nextY;
        currentBeam = nextBeam;
    }
    
    return result;
}