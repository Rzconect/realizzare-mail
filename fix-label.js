const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

c = c.replace(/const label = formatLabel\(dateObj\);/g, 'const label = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}`;');

fs.writeFileSync('src/app/dashboard/page.tsx', c);
console.log('Fixed label format');
