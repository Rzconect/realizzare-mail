const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

c = c.replace(/\\n\s+notes\?: any\[\];/g, '\n  notes?: any[];');
c = c.replace(/assignedTo\?: string;\\n  notes\?: any\[\];/g, 'assignedTo?: string;\n  notes?: any[];');

fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
console.log('Fixed literal newline in page.tsx');
