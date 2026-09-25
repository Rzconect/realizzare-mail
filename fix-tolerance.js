const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const regex = /const tA = new Date\(a\.timestamp\)\.getTime\(\);\n\s*const tB = new Date\(b\.timestamp\)\.getTime\(\);\n\s*if \(tA !== tB\) return tB - tA;/;

const newSort = `const tA = new Date(a.timestamp).getTime();
            const tB = new Date(b.timestamp).getTime();
            if (Math.abs(tB - tA) > 2000) return tB - tA; // Standard sort if events are more than 2 seconds apart`;

c = c.replace(regex, newSort);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed timeline tolerance sorting');
