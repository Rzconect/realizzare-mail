const fs = require('fs');
const path = 'src/app/dashboard/conversations/page.tsx';
const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

let startIdx = 1431;
let count = 13; // We know it's exactly 1431 to 1443 based on previous inspection!

// Verify first
console.log("Removing:");
console.log(lines.slice(startIdx, startIdx + count).join('\n'));

lines.splice(startIdx, count);

fs.writeFileSync(path, lines.join('\n'));
console.log('Removed duplicate block');
