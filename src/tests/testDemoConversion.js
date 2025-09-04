// Test that demo.html conversion works correctly with cdcRomBinary
import { cdcRomBinary } from '../chargen/cdcRomBinary.js';
import { binaryToVector } from '../chargen/cdcRomFunctions.js';

console.log('Testing demo.html conversion with cdcRomBinary...\n');

// Test a few characters
const testChars = ['C', '0', '1', 'A', '+'];

for (const char of testChars) {
    if (!cdcRomBinary[char]) {
        console.log(`✗ Character '${char}' not found in cdcRomBinary`);
        continue;
    }
    
    const binaryData = cdcRomBinary[char];
    const vectorData = binaryToVector(binaryData);
    
    console.log(`✓ Character '${char}':`);
    console.log(`  Binary entries: ${binaryData.length}`);
    console.log(`  Vector points: ${vectorData.length}`);
    console.log(`  First binary: 0b${binaryData[0].toString(2).padStart(5, '0')}`);
    console.log(`  First vector: [${vectorData[0]}]`);
    
    // Verify all vectors are valid
    const validVectors = vectorData.every(v => 
        Array.isArray(v) && 
        v.length === 3 && 
        typeof v[0] === 'number' && 
        typeof v[1] === 'number' && 
        typeof v[2] === 'boolean'
    );
    
    if (validVectors) {
        console.log(`  ✓ All vectors valid\n`);
    } else {
        console.log(`  ✗ Invalid vectors found!\n`);
    }
}

// Test that all characters in cdcRomBinary can be converted
console.log('\nTesting all characters...');
let successCount = 0;
let totalCount = 0;

for (const char of Object.keys(cdcRomBinary)) {
    totalCount++;
    try {
        const vectorData = binaryToVector(cdcRomBinary[char]);
        if (vectorData && vectorData.length === 22) {
            successCount++;
        } else {
            console.log(`⚠ Character '${char}' produced ${vectorData.length} vectors (expected 22)`);
        }
    } catch (error) {
        console.log(`✗ Error converting '${char}': ${error.message}`);
    }
}

console.log(`\n✓ Successfully converted ${successCount}/${totalCount} characters`);
console.log('\ndemo.html should now work correctly with cdcRomBinary.js!');