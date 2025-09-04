// Compare decoded binary data with original vectorRomCDC6602.js
// This will identify where the encoding/decoding differs

import { vectorCharacterRomCDC6602 } from '../chargen/archive_to_delete/vectorRomCDC6602.js';
import { cdcRomBinary } from '../chargen/cdcRomBinary.js';
import { binaryToVector } from '../chargen/cdcRomFunctions.js';

/**
 * Compare two characters in detail
 */
function compareCharacter(char) {
    const original = vectorCharacterRomCDC6602[char];
    const binary = cdcRomBinary[char];
    const decoded = binaryToVector(binary);
    
    console.log(`\nCharacter "${char}" Comparison:`);
    console.log('=' .repeat(60));
    console.log(`Original: ${original.length} vectors`);
    console.log(`Binary:   ${binary.length} entries`);
    console.log(`Decoded:  ${decoded.length} vectors`);
    
    if (original.length !== decoded.length) {
        console.log('ERROR: Length mismatch!');
        return false;
    }
    
    let firstError = -1;
    let matchCount = 0;
    
    // Detailed comparison
    console.log('\n  #  | Original        | Decoded         | Binary     | Match');
    console.log('-----|-----------------|-----------------|------------|------');
    
    for (let i = 0; i < original.length; i++) {
        const [ox, oy, ob] = original[i];
        const [dx, dy, db] = decoded[i];
        const match = (ox === dx && oy === dy && ob === db);
        
        if (match) matchCount++;
        if (!match && firstError === -1) firstError = i;
        
        const binStr = binary[i].toString(2).padStart(5, '0');
        const label = i === 0 ? '76' : (i-1).toString(8).padStart(2, '0');
        
        console.log(
            ` ${label} | ` +
            `(${ox.toString().padStart(2)},${oy.toString().padStart(2)},${ob?'ON ':'OFF'}) | ` +
            `(${dx.toString().padStart(2)},${dy.toString().padStart(2)},${db?'ON ':'OFF'}) | ` +
            `${binStr} | ` +
            (match ? '  ✓' : '  ✗')
        );
        
        // Stop after first few errors to avoid clutter
        if (!match && i > firstError + 5) {
            console.log('  ... (remaining entries omitted)');
            break;
        }
    }
    
    console.log(`\nMatches: ${matchCount}/${original.length} (${(matchCount/original.length*100).toFixed(1)}%)`);
    if (firstError >= 0) {
        console.log(`First error at position ${firstError} (T=${firstError === 0 ? '76' : (firstError-1).toString(8).padStart(2, '0')})`);
    }
    
    return matchCount === original.length;
}

/**
 * Analyze movement patterns
 */
function analyzeMovements(char) {
    const original = vectorCharacterRomCDC6602[char];
    const binary = cdcRomBinary[char];
    
    console.log(`\nMovement Analysis for "${char}":`);
    console.log('=' .repeat(60));
    
    let hDir = 1, vDir = 1;
    let hToggleNeeded = 0, vToggleNeeded = 0;
    
    for (let i = 0; i < original.length; i++) {
        const [x, y, beam] = original[i];
        const [px, py] = i > 0 ? original[i-1] : [0, 0];
        const dx = x - px;
        const dy = y - py;
        
        // Check if direction change needed
        if (dx !== 0) {
            const neededHDir = dx > 0 ? 1 : -1;
            if (neededHDir !== hDir) {
                hToggleNeeded++;
                console.log(`  [${i}] H direction change needed: ${hDir>0?'+':'-'} → ${neededHDir>0?'+':'-'} (dx=${dx})`);
                hDir = neededHDir;
            }
        }
        
        if (dy !== 0) {
            const neededVDir = dy > 0 ? 1 : -1;
            if (neededVDir !== vDir) {
                vToggleNeeded++;
                console.log(`  [${i}] V direction change needed: ${vDir>0?'+':'-'} → ${neededVDir>0?'+':'-'} (dy=${dy})`);
                vDir = neededVDir;
            }
        }
    }
    
    console.log(`\nTotal direction changes needed:`);
    console.log(`  Horizontal: ${hToggleNeeded}`);
    console.log(`  Vertical:   ${vToggleNeeded}`);
    console.log(`  Total:      ${hToggleNeeded + vToggleNeeded}`);
}

/**
 * Test all characters
 */
function testAll() {
    console.log('Complete Character Set Test');
    console.log('=' .repeat(60));
    
    let totalPass = 0;
    let totalFail = 0;
    const failures = [];
    
    for (const char of Object.keys(vectorCharacterRomCDC6602).sort()) {
        const original = vectorCharacterRomCDC6602[char];
        const decoded = binaryToVector(cdcRomBinary[char]);
        
        let match = true;
        for (let i = 0; i < original.length; i++) {
            const [ox, oy, ob] = original[i];
            const [dx, dy, db] = decoded[i];
            if (ox !== dx || oy !== dy || ob !== db) {
                match = false;
                break;
            }
        }
        
        if (match) {
            console.log(`✓ "${char}"`);
            totalPass++;
        } else {
            console.log(`✗ "${char}"`);
            totalFail++;
            failures.push(char);
        }
    }
    
    console.log(`\nResults: ${totalPass} passed, ${totalFail} failed`);
    if (failures.length > 0) {
        console.log(`Failed characters: ${failures.join(', ')}`);
    }
    
    return failures;
}

// Main execution
console.log('CDC ROM Binary vs Original Vector Comparison Test');
console.log('=' .repeat(60));

// Quick test of all characters
const failures = testAll();

// Detailed analysis of specific characters
console.log('\n' + '=' .repeat(60));
console.log('DETAILED ANALYSIS');
console.log('=' .repeat(60));

// Analyze letter C in detail
compareCharacter('C');
analyzeMovements('C');

// Analyze a simple character that might work
console.log('\n' + '=' .repeat(60));
compareCharacter(' ');  // Space character should be simple

// Analyze a failed character
if (failures.length > 0 && failures[0] !== 'C') {
    console.log('\n' + '=' .repeat(60));
    compareCharacter(failures[0]);
    analyzeMovements(failures[0]);
}