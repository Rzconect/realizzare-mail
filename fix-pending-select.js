const fs = require('fs');

let c = fs.readFileSync('src/app/api/crm/sync/route.ts', 'utf8');

c = c.replace(
  /\.select\("first_name, last_name, email, phone"\)/g,
  '.select("id, first_name, last_name, email, phone")'
);

fs.writeFileSync('src/app/api/crm/sync/route.ts', c);
console.log('Fixed pending events contact id select');
