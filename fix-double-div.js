const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/<\/div>\s*<\/div>\s*<\/>\s*\);\s*\}\)\(\)\s*\) : \(/g, '</div>\n</>\n);\n})()\n) : (');

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed double div');
