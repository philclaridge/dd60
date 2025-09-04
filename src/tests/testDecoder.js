// Test the CDC ROM binary decoder
// Verifies that binaryToVector correctly implements the CDC 6602 decoding algorithm

import { cdcRomBinary } from '../chargen/cdcRomBinary.js';
import { getCharacterVector, binaryToVector } from '../chargen/cdcRomFunctions.js';

console.log('Testing CDC ROM Binary Decoder');
console.log('===============================\n');

// Test letter 'C' decoding step by step
console.log('Decoding Letter "C" Step-by-Step:');
console.log('----------------------------------');

const letterC_binary = cdcRomBinary['C'];
let x = 0, y = 0, beam = false, hDir = 1, vDir = 1;

console.log('Initial: pos(0,0) beam=OFF hDir=+ vDir=+\n');

for (let i = 0; i < Math.min(10, letterC_binary.length); i++) {
    const binary = letterC_binary[i];
    const V1 = (binary >> 4) & 1;
    const V2 = (binary >> 3) & 1;
    const H1 = (binary >> 2) & 1;
    const H2 = (binary >> 1) & 1;
    const U = binary & 1;
    
    const label = i === 0 ? '76' : (i-1).toString(8).padStart(2, '0');
    
    // Apply movements
    let moveDesc = [];
    
    if (V1 && V2) {
        vDir = -vDir;
        moveDesc.push(`V-toggle(${vDir > 0 ? '+' : '-'})`);
    } else if (V1) {
        y += 1 * vDir;
        moveDesc.push(`V${vDir > 0 ? '+' : '-'}1`);
    } else if (V2) {
        y += 2 * vDir;
        moveDesc.push(`V${vDir > 0 ? '+' : '-'}2`);
    }
    
    if (H1 && H2) {
        hDir = -hDir;
        moveDesc.push(`H-toggle(${hDir > 0 ? '+' : '-'})`);
    } else if (H1) {
        x += 1 * hDir;
        moveDesc.push(`H${hDir > 0 ? '+' : '-'}1`);
    } else if (H2) {
        x += 2 * hDir;
        moveDesc.push(`H${hDir > 0 ? '+' : '-'}2`);
    }
    
    if (U) {
        beam = !beam;
        moveDesc.push(`Beam=${beam ? 'ON' : 'OFF'}`);
    }
    
    const bits = `${V1}${V2}${H1}${H2}${U}`;
    console.log(`T=${label}: ${bits} → ${moveDesc.join(', ') || 'no change'} → pos(${x},${y}) beam=${beam ? 'ON' : 'OFF'}`);
}

console.log('\n' + '='.repeat(50));
console.log('Full Decoding Test:');
console.log('-------------------');

// Test full decoding
const decoded = getCharacterVector('C');
console.log(`\nLetter 'C' decoded to ${decoded.length} vectors`);
console.log('First 5 positions:');
for (let i = 0; i < 5 && i < decoded.length; i++) {
    const [x, y, beam] = decoded[i];
    console.log(`  [${i}]: (${x}, ${y}) beam=${beam ? 'ON' : 'OFF'}`);
}

console.log('\nExpected first positions (from original):');
console.log('  [0]: (2, 2) beam=OFF');
console.log('  [1]: (4, 4) beam=OFF');
console.log('  [2]: (6, 5) beam=OFF');
console.log('  [3]: (6, 5) beam=OFF');
console.log('  [4]: (6, 5) beam=ON');

// Test a few more characters
console.log('\n' + '='.repeat(50));
console.log('Testing Additional Characters:');
console.log('------------------------------');

const testChars = ['0', '1', 'A', '+'];
for (const char of testChars) {
    const vectors = getCharacterVector(char);
    const firstThree = vectors.slice(0, 3).map(([x, y, b]) => `(${x},${y},${b ? 'ON' : 'OFF'})`);
    console.log(`"${char}": ${vectors.length} vectors, first 3: ${firstThree.join(' ')}`);
}