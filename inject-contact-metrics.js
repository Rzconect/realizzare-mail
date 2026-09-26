const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(
  'const emailsOpenedCount = new Set(rawEvents.filter((e) => e.type === "open").map(e => e.payload?.campaign_id)).size;',
  'const emailsOpenedCount = new Set(rawEvents.filter((e) => e.type === "open").map(e => e.payload?.campaign_id || e.payload?.node_id)).size;'
);

c = c.replace(
  'const emailsClickedCount = new Set(rawEvents.filter((e) => e.type === "email_click").map(e => e.payload?.campaign_id)).size;',
  'const emailsClickedCount = new Set(rawEvents.filter((e) => e.type === "email_click").map(e => e.payload?.campaign_id || e.payload?.node_id)).size;'
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Modified contacts/[id]/page.tsx metrics safely');
