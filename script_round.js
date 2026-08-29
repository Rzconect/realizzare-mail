const fs = require('fs');
const path = 'src/app/dashboard/campaigns/create/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/rounded-xl/g, "rounded-md");

fs.writeFileSync(path, content, 'utf8');
console.log('done');