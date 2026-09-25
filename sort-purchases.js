const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');
c = c.replace(/\(profile as any\)\.purchases\.map/g, '[...(profile as any).purchases].sort((a: any, b: any) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime()).map');
fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Sorted purchases');
