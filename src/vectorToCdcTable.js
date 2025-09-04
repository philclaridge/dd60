// Vector ROM CDC6602 to Original Table Format Converter
// Converts [x, y, beam] coordinate format back to CDC 6602 V1, V2, H1, H2, U flag format

/**
 * Converts character data from vectorRomCDC6602.js format back to original CDC 6602 table format
 * Based on CDC 6602 documentation: Each stroke can move 0, 1, or 2 units in X and/or Y direction
 * Direction flags toggle when both H1&H2 or V1&V2 are set
 * @param {Array} vectorData - Array of [x, y, beam] coordinates
 * @param {string} characterLabel - Character label for display purposes
 * @returns {Object} Object containing binary table and detailed breakdown
 */
export function convertVectorToCdcTable(vectorData, characterLabel = '') {
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
        
        // Determine movement flags based on actual movement
        let V1 = false, V2 = false, H1 = false, H2 = false, U = false;
        
        // Simple mapping based on actual movement
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
        
        // Create binary representation: 0bVVHHU where V=V1V2, H=H1H2, U=U
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

/**
 * Generates an HTML table representation of the CDC table format
 * @param {Object} tableData - Result from convertVectorToCdcTable
 * @returns {string} HTML table string
 */
export function generateCdcTableHTML(tableData) {
    if (!tableData || !tableData.detailedTable) {
        throw new Error('Invalid table data provided');
    }
    
    let html = `
    <h3>CDC 6602 Table Format for Character '${tableData.character}'</h3>
    <table border="1" cellpadding="5" cellspacing="0" style="font-family: monospace;">
        <thead>
            <tr style="background-color: #f0f0f0;">
                <th>Label</th>
                <th>Position</th>
                <th>Delta</th>
                <th>Beam</th>
                <th>V1</th>
                <th>V2</th>
                <th>H1</th>
                <th>H2</th>
                <th>U</th>
                <th>Binary</th>
                <th>Dec</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    tableData.detailedTable.forEach(entry => {
        html += `
            <tr>
                <td>${entry.label}</td>
                <td>(${entry.position[0]}, ${entry.position[1]})</td>
                <td>(${entry.delta[0] >= 0 ? '+' + entry.delta[0] : entry.delta[0]}, ${entry.delta[1] >= 0 ? '+' + entry.delta[1] : entry.delta[1]})</td>
                <td style="color: ${entry.beam === 'ON' ? 'green' : 'red'};">${entry.beam}</td>
                <td>${entry.flags.V1}</td>
                <td>${entry.flags.V2}</td>
                <td>${entry.flags.H1}</td>
                <td>${entry.flags.H2}</td>
                <td>${entry.flags.U}</td>
                <td>${entry.binary}</td>
                <td>${entry.decimal}</td>
            </tr>
        `;
    });
    
    html += `
        </tbody>
    </table>
    <p><strong>Summary:</strong> ${tableData.summary.totalStrokes} strokes total, 
    ${tableData.summary.beamOnStrokes} with beam ON, ${tableData.summary.beamOffStrokes} with beam OFF</p>
    `;
    
    return html;
}

/**
 * Test function to verify the conversion with letter 'C'
 * @param {Object} vectorCharacterRom - The character ROM data
 * @returns {Object} Test results for letter 'C'
 */
export function testLetterC(vectorCharacterRom) {
    if (!vectorCharacterRom || !vectorCharacterRom['C']) {
        throw new Error('Vector character ROM data for letter C not found');
    }
    
    const letterCData = vectorCharacterRom['C'];
    const result = convertVectorToCdcTable(letterCData, 'C');
    
    console.log('Letter C Conversion Test Results:');
    console.log('=================================');
    console.log('Binary sequence:', result.binarySequence.join(', '));
    console.log('\nDetailed breakdown:');
    console.table(result.detailedTable);
    console.log('\nSummary:', result.summary);
    
    return result;
}