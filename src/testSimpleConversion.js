// Test the simple conversion method
import { vectorCharacterRomCDC6602 } from './archive_to_delete/vectorRomCDC6602.js';
import { convertVectorToCdcTableSimple } from './vectorToCdcTableCorrect.js';

console.log('Testing Simple Conversion Method');
console.log('===============================\n');

// Test letter C
const letterC = vectorCharacterRomCDC6602['C'];
const resultC = convertVectorToCdcTableSimple(letterC, 'C');

console.log('Letter C Results:');
console.log('Binary sequence:', resultC.binarySequence.join(', '));
console.log('\nDetailed table:');
resultC.detailedTable.forEach(entry => {
    const deltaX = entry.delta[0] >= 0 ? `+${entry.delta[0]}` : entry.delta[0];
    const deltaY = entry.delta[1] >= 0 ? `+${entry.delta[1]}` : entry.delta[1];
    console.log(`${entry.label}: pos(${entry.position[0]}, ${entry.position[1]}) delta(${deltaX}, ${deltaY}) beam=${entry.beam} flags=${entry.flags.V1}${entry.flags.V2}${entry.flags.H1}${entry.flags.H2}${entry.flags.U} ${entry.binary}`);
});

console.log('\nSummary:', resultC.summary);

// Verify expected binary sequence for letter C
console.log('\nExpected vs Actual Analysis:');
console.log('============================');

// The letter C should start at (2,2) with beam OFF, then move to draw the C shape
const expectedSequence = [
    '0b01010', // Move +2V, +2H to (2,2)
    '0b01010', // Move +2V, +2H to (4,4)  
    '0b10010', // Move +1V, +2H to (6,5)
    '0b00000', // No movement
    '0b00001', // Turn beam ON
    '0b10010', // Move +1V, +2H (but this is -2H, +1V - need to handle direction)
];

console.log('First few expected binary values:', expectedSequence.slice(0, 6));
console.log('First few actual binary values:  ', resultC.binarySequence.slice(0, 6));