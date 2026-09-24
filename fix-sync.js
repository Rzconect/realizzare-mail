const fs = require('fs');
let c = fs.readFileSync('src/app/api/crm/sync/route.ts', 'utf8');

c = c.replace(`        columnId: "novo",`, `        columnId: evt.metadata?.crm_column || "novo",`);
c = c.replace(`        assignedTo: "Sem responsável",`, `        assignedTo: evt.metadata?.crm_assigned || "Sem responsável",`);
c = c.replace(`        archived: false,`, `        archived: evt.metadata?.crm_archived || false,`);

c = c.replace(`        columnId: "novo",`, `        columnId: p.metadata?.crm_column || "novo",`);
c = c.replace(`        assignedTo: "Sem responsável",`, `        assignedTo: p.metadata?.crm_assigned || "Sem responsável",`);
c = c.replace(`        archived: false,`, `        archived: p.metadata?.crm_archived || false,`);

fs.writeFileSync('src/app/api/crm/sync/route.ts', c);
console.log('done');
