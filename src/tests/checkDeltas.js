import { vectorCharacterRomCDC6602 } from '../chargen/archive_to_delete/vectorRomCDC6602.js';

const c = vectorCharacterRomCDC6602['C'];
console.log('Letter C deltas:');
for(let i=0; i<15; i++) { 
    const [x,y,b] = c[i]; 
    const [px,py,pb] = i>0 ? c[i-1] : [0,0,false]; 
    const dx=x-px, dy=y-py; 
    console.log(`[${i}]: (${x},${y},${b?'ON':'OFF'}) delta=(${dx>=0?'+':''}${dx},${dy>=0?'+':''}${dy}) toggle=${b!==pb}`);
}