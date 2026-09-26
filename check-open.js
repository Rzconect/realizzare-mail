const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const search = 'type: "open"';
const idx = c.indexOf(search);
console.log(c.substring(Math.max(0, idx - 500), idx + 800));
