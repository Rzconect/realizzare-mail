const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

const colTarget = `className="flex-1 overflow-y-auto px-1 space-y-3 pb-6 custom-scrollbar"`;
const colReplacement = `className="flex-1 overflow-y-auto px-3 pt-3 space-y-3 pb-6 custom-scrollbar"`;
c = c.replace(colTarget, colReplacement);

const dealsTarget = `const colDeals = deals.filter((d) => d.columnId === col.id && d.boardId === activeBoard && !d.archived);`;
const dealsReplacement = `const uniqueDealsMap = new Map();
                  deals.filter((d) => d.columnId === col.id && d.boardId === activeBoard && !d.archived).forEach(d => uniqueDealsMap.set(d.id, d));
                  const colDeals = Array.from(uniqueDealsMap.values());`;
c = c.replace(dealsTarget, dealsReplacement);

fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
console.log('done');
