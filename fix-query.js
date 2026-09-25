const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/automations/page.tsx', 'utf8');

c = c.replace('.eq("is_deleted", false)', '');

fs.writeFileSync('src/app/dashboard/automations/page.tsx', c);
console.log('Fixed flows table query safely');
