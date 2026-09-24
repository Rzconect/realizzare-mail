const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const target = `const purchases = Array.from(purchaseDedupeMap.values()).map((p: any) => ({`;
const replace = `const purchases = Array.from(purchaseDedupeMap.values()).sort((a: any, b: any) => new Date(b.paid_at || b.created_at || 0).getTime() - new Date(a.paid_at || a.created_at || 0).getTime()).map((p: any) => ({`;

if (c.includes(target)) {
  c = c.replace(target, replace);
  fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
  console.log('Contacts purchases sorted');
} else {
  console.log('Target not found in contacts page');
}
