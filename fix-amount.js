const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/\(t\.amount \/ 100\)\.toFixed\(2\)\.replace\('\.', ','\)/g, "Number(t.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })");

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed amount rendering');
