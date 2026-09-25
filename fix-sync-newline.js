const fs = require('fs');
let c = fs.readFileSync('src/app/api/crm/sync/route.ts', 'utf8');

c = c.replace(/\\n\s+notes:/g, '\n        notes:');

fs.writeFileSync('src/app/api/crm/sync/route.ts', c);
console.log('Fixed sync route');
