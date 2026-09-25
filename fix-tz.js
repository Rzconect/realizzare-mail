const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const search = 'Entrou em: {new Date(flow.entered_at).toLocaleDateString("pt-BR")}';
const block = 'Entrou em: {flow.entered_at.split("-").reverse().join("/")}';

const replaced = c.split(search).join(block);
fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', replaced);
console.log('Fixed timezone parsing');
