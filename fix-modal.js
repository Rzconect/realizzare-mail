const fs = require('fs');
let c = fs.readFileSync('src/components/crm/DealModal.tsx', 'utf8');

c = c.replace(/\\n/g, '\n');

fs.writeFileSync('src/components/crm/DealModal.tsx', c);
console.log('Fixed using file script');
