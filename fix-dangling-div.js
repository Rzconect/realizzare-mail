const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/\{\/\* Notes \*\/\}\s*<div className="mt-4">\s*/g, '');

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed dangling div');
