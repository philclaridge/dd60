// Demonstrate proper CDC ROM encoding with direction tracking
// This shows how letter 'C' should be encoded to maintain direction state

const letterC_vectors = [
    [2, 2, false], [4, 4, false], [6, 5, false], [6, 5, false], [6, 5, true],
    [4, 6, true], [2, 6, true], [0, 5, true], [0, 3, true], [0, 1, true],
    [2, 0, true], [4, 0, true], [6, 1, true], [6, 1, true], [6, 1, false],
    [6, 1, false], [6, 1, false], [6, 1, false], [6, 1, false], [6, 1, false],
    [6, 1, false], [6, 1, false]
];

console.log('Proper CDC ROM Encoding for Letter "C"');
console.log('=======================================\n');

let currentX = 0, currentY = 0, beamOn = false;
let hDir = 1, vDir = 1;  // 1=positive, -1=negative
const properBinary = [];

for (let i = 0; i < letterC_vectors.length; i++) {
    const [targetX, targetY, targetBeam] = letterC_vectors[i];
    const deltaX = targetX - currentX;
    const deltaY = targetY - currentY;
    
    let V1 = 0, V2 = 0, H1 = 0, H2 = 0, U = 0;
    
    // Handle vertical movement
    if (deltaY !== 0) {
        const absY = Math.abs(deltaY);
        const neededDir = deltaY > 0 ? 1 : -1;
        
        if (neededDir !== vDir) {
            // Need to toggle vertical direction first
            // This would require an extra stroke!
            // For now, note this limitation
            console.log(`  [${i}] WARNING: Need V direction toggle from ${vDir>0?'+':'-'} to ${neededDir>0?'+':'-'}`);
        }
        
        if (absY === 1) V1 = 1;
        else if (absY === 2) V2 = 1;
    }
    
    // Handle horizontal movement  
    if (deltaX !== 0) {
        const absX = Math.abs(deltaX);
        const neededDir = deltaX > 0 ? 1 : -1;
        
        if (neededDir !== hDir) {
            // Need to toggle horizontal direction
            console.log(`  [${i}] WARNING: Need H direction toggle from ${hDir>0?'+':'-'} to ${neededDir>0?'+':'-'}`);
            // Should insert a toggle stroke here
        }
        
        if (absX === 1) H1 = 1;
        else if (absX === 2) H2 = 1;
    }
    
    // Handle beam toggle
    if (targetBeam !== beamOn) {
        U = 1;
        beamOn = targetBeam;
    }
    
    const binary = (V1 << 4) | (V2 << 3) | (H1 << 2) | (H2 << 1) | U;
    const binaryStr = '0b' + binary.toString(2).padStart(5, '0');
    const pattern = [V1, V2, H1, H2, U].map(b => b ? 'X' : '.').join('');
    
    const label = i === 0 ? '76' : (i-1).toString(8).padStart(2, '0');
    console.log(`T=${label}: ${pattern} ${binaryStr} pos(${currentX},${currentY})→(${targetX},${targetY}) beam=${targetBeam?'ON':'OFF'}`);
    
    properBinary.push(binary);
    currentX = targetX;
    currentY = targetY;
}

console.log('\nIssue: The simple encoder doesn\'t insert direction toggle strokes!');
console.log('This is why decoding fails - movements after direction changes are wrong.');
console.log('\nProper encoding would need to:');
console.log('1. Track direction state');
console.log('2. Insert toggle strokes when direction changes');
console.log('3. Then emit the movement stroke');

console.log('\nFor example, at position [5]:');
console.log('  Need to move from (6,5) to (4,6)');
console.log('  Delta: (-2, +1)');
console.log('  Should emit TWO strokes:');
console.log('    1. ..XX. to toggle H direction');
console.log('    2. X..X. to move V+1, H+2 (now in negative H direction)');