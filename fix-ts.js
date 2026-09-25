const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');
const search = "const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };";
const block = "const options: Intl.DateTimeFormatOptions = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };";
c = c.replace(search, block);
fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed TypeScript options');
