const fs = require('fs');
let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

c = c.replace('<div className="space-y-3">', '<div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar" style={{ minHeight: "150px" }}>');

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed list layout');
