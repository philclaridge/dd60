// Test file for vector to CDC table conversion
import { vectorCharacterRomCDC6602 } from '../chargen/archive_to_delete/vectorRomCDC6602.js';
import { convertVectorToCdcTable, generateCdcTableHTML, testLetterC } from '../vectorToCdcTable.js';

/**
 * Test the conversion function with multiple characters
 */
function runConversionTests() {
    console.log('Vector to CDC Table Conversion Tests');
    console.log('===================================\n');
    
    // Test with letter 'C'
    try {
        console.log('Testing Letter C:');
        const letterCResult = testLetterC(vectorCharacterRomCDC6602);
        
        // Display the vector data for letter C
        console.log('\nOriginal vector data for letter C:');
        vectorCharacterRomCDC6602['C'].forEach((point, index) => {
            console.log(`  ${index}: [${point[0]}, ${point[1]}, ${point[2]}]`);
        });
        
    } catch (error) {
        console.error('Error testing letter C:', error.message);
    }
    
    // Test with a few other characters for variety
    const testCharacters = ['0', '1', 'A', '+'];
    
    testCharacters.forEach(char => {
        try {
            console.log(`\n\nTesting Character '${char}':`);
            console.log('==============================');
            
            if (!vectorCharacterRomCDC6602[char]) {
                console.log(`Character '${char}' not found in ROM data`);
                return;
            }
            
            const result = convertVectorToCdcTable(vectorCharacterRomCDC6602[char], char);
            
            console.log(`Binary sequence: ${result.binarySequence.join(', ')}`);
            console.log(`Summary: ${result.summary.totalStrokes} strokes, ${result.summary.beamOnStrokes} ON, ${result.summary.beamOffStrokes} OFF`);
            
            // Show first few entries in detail
            console.log('\nFirst 5 table entries:');
            result.detailedTable.slice(0, 5).forEach(entry => {
                const deltaXStr = entry.delta[0] >= 0 ? `+${entry.delta[0]}` : `${entry.delta[0]}`;
                const deltaYStr = entry.delta[1] >= 0 ? `+${entry.delta[1]}` : `${entry.delta[1]}`;
                console.log(`  ${entry.label}: pos(${entry.position[0]}, ${entry.position[1]}) delta(${deltaXStr}, ${deltaYStr}) beam=${entry.beam} flags=${entry.flags.V1}${entry.flags.V2}${entry.flags.H1}${entry.flags.H2}${entry.flags.U} ${entry.binary}`);
            });
            
        } catch (error) {
            console.error(`Error testing character '${char}':`, error.message);
        }
    });
}

/**
 * Generate HTML output for letter C
 */
function generateHTMLOutput() {
    try {
        const letterCResult = convertVectorToCdcTable(vectorCharacterRomCDC6602['C'], 'C');
        const htmlTable = generateCdcTableHTML(letterCResult);
        
        console.log('\n\nHTML Table for Letter C:');
        console.log('========================');
        console.log(htmlTable);
        
        return htmlTable;
    } catch (error) {
        console.error('Error generating HTML:', error.message);
        return null;
    }
}

/**
 * Analyze the direction flag logic by examining movement patterns
 */
function analyzeDirectionLogic() {
    console.log('\n\nDirection Logic Analysis:');
    console.log('========================');
    
    try {
        const letterCData = vectorCharacterRomCDC6602['C'];
        console.log('Letter C movement analysis:');
        
        let prevX = 0, prevY = 0;
        for (let i = 0; i < letterCData.length; i++) {
            const [x, y, beam] = letterCData[i];
            const deltaX = x - prevX;
            const deltaY = y - prevY;
            const deltaXStr = deltaX >= 0 ? `+${deltaX}` : `${deltaX}`;
            const deltaYStr = deltaY >= 0 ? `+${deltaY}` : `${deltaY}`;
            
            console.log(`Step ${i}: (${prevX}, ${prevY}) -> (${x}, ${y}) = delta(${deltaXStr}, ${deltaYStr}) beam=${beam ? 'ON' : 'OFF'}`);
            
            prevX = x;
            prevY = y;
        }
    } catch (error) {
        console.error('Error analyzing direction logic:', error.message);
    }
}

// Run the tests
if (typeof window === 'undefined') {
    // Running in Node.js
    runConversionTests();
    generateHTMLOutput();
    analyzeDirectionLogic();
} else {
    // Running in browser - attach to window for testing
    window.testVectorConversion = {
        runConversionTests,
        generateHTMLOutput,
        analyzeDirectionLogic
    };
    
    console.log('Test functions attached to window.testVectorConversion');
}