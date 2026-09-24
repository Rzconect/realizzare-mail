const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');
if (!c.includes('Unlink,')) {
  c = c.replace('Search, Filter,', 'Search, Filter, Unlink,');
  fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
  console.log('Fixed import');
}
