const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const regex1 = /\{\/\* Tabs for Right Panel \*\/\}[\s\S]*?\{rightPanelTab === 'timeline' && \(\s*<>/;
c = c.replace(regex1, '');

const regex2 = /<\/div>\s*<\/>\s*\)\}\s*<\/div>/;
c = c.replace(regex2, '</div></div>');

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Removed tabs!');
