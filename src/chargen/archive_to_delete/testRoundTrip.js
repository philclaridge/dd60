// Test round-trip conversion: Original Vector → Binary → Vector
// Verifies that the CDC ROM binary format can accurately reproduce the original vector data

import { vectorCharacterRomCDC6602 } from '../chargen/archive_to_delete/vectorRomCDC6602.js';
import { generateVectorRom, getCharacterVector } from '../chargen/cdcRomFunctions.js';

/**
 * Compare two vector arrays for equality
 * @param {Array} vec1 - First vector array
 * @param {Array} vec2 - Second vector array
 * @returns {boolean} True if arrays are equal
 */
function vectorsEqual(vec1, vec2) {
    if (vec1.length !== vec2.length) return false;
    
    for (let i = 0; i < vec1.length; i++) {
        const [x1, y1, b1] = vec1[i];
        const [x2, y2, b2] = vec2[i];
        if (x1 !== x2 || y1 !== y2 || b1 !== b2) {
            return false;
        }
    }
    return true;
}

/**
 * Test individual character conversion
 * @param {string} char - Character to test
 * @returns {Object} Test result with details
 */
function testCharacter(char) {
    const original = vectorCharacterRomCDC6602[char];
    const regenerated = getCharacterVector(char);
    
    const result = {
        char: char,
        originalLength: original.length,
        regeneratedLength: regenerated.length,
        lengthMatch: original.length === regenerated.length,
        contentMatch: vectorsEqual(original, regenerated),
        differences: []
    };
    
    // Find specific differences if they don't match
    if (!result.contentMatch) {
        const minLength = Math.min(original.length, regenerated.length);
        for (let i = 0; i < minLength; i++) {
            const [x1, y1, b1] = original[i];
            const [x2, y2, b2] = regenerated[i];
            if (x1 !== x2 || y1 !== y2 || b1 !== b2) {
                result.differences.push({
                    index: i,
                    original: [x1, y1, b1],
                    regenerated: [x2, y2, b2]
                });
            }
        }
    }
    
    return result;
}

/**
 * Run complete round-trip test for all characters
 */
function runRoundTripTest() {
    console.log('Round-Trip Conversion Test');
    console.log('==========================\n');
    
    console.log('Testing: Original Vector Format → Binary ROM → Regenerated Vector\n');
    
    const allChars = Object.keys(vectorCharacterRomCDC6602).sort();
    let passCount = 0;
    let failCount = 0;
    const failures = [];
    
    // Test each character
    for (const char of allChars) {
        const result = testCharacter(char);
        
        if (result.lengthMatch && result.contentMatch) {
            passCount++;
            console.log(`✓ "${char}" - Perfect match (${result.originalLength} vectors)`);
        } else {
            failCount++;
            failures.push(result);
            console.log(`✗ "${char}" - MISMATCH`);
            if (!result.lengthMatch) {
                console.log(`  Length: original=${result.originalLength}, regenerated=${result.regeneratedLength}`);
            }
            if (result.differences.length > 0) {
                console.log(`  First difference at index ${result.differences[0].index}:`);
                console.log(`    Original:    ${JSON.stringify(result.differences[0].original)}`);
                console.log(`    Regenerated: ${JSON.stringify(result.differences[0].regenerated)}`);
            }
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('Test Summary:');
    console.log(`Total characters tested: ${allChars.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Success rate: ${((passCount / allChars.length) * 100).toFixed(1)}%`);
    
    if (failures.length > 0) {
        console.log('\nFailed characters:', failures.map(f => f.char).join(', '));
    }
    
    // Test specific cases
    console.log('\n' + '='.repeat(50));
    console.log('Detailed Test: Letter "C"');
    console.log('-'.repeat(30));
    
    const letterC_original = vectorCharacterRomCDC6602['C'];
    const letterC_regenerated = getCharacterVector('C');
    
    console.log('First 5 vectors comparison:');
    for (let i = 0; i < 5; i++) {
        const orig = letterC_original[i];
        const regen = letterC_regenerated[i];
        const match = orig[0] === regen[0] && orig[1] === regen[1] && orig[2] === regen[2];
        console.log(`  [${i}] Original: [${orig}] | Regenerated: [${regen}] | ${match ? '✓' : '✗'}`);
    }
    
    // Test batch generation
    console.log('\n' + '='.repeat(50));
    console.log('Testing batch generation with generateVectorRom()...');
    const startTime = Date.now();
    const fullRom = generateVectorRom();
    const elapsed = Date.now() - startTime;
    
    console.log(`Generated full ROM with ${Object.keys(fullRom).length} characters in ${elapsed}ms`);
    
    // Verify batch generation matches individual generation
    let batchMatchCount = 0;
    for (const char of allChars) {
        if (vectorsEqual(fullRom[char], vectorCharacterRomCDC6602[char])) {
            batchMatchCount++;
        }
    }
    console.log(`Batch generation accuracy: ${batchMatchCount}/${allChars.length} characters match`);
    
    return passCount === allChars.length;
}

// Run the test
const success = runRoundTripTest();
process.exit(success ? 0 : 1);