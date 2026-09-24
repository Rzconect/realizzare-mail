const fs = require('fs');
let c = fs.readFileSync('src/app/api/crm/sync/route.ts', 'utf8');

c = c.replace(
  /\.select\("id, created_at, metadata, contacts\(first_name, last_name, email, phone\)"\)/g,
  '.select("id, created_at, metadata, contacts(id, first_name, last_name, email, phone)")'
);

c = c.replace(
  /contacts\(first_name, last_name, email, phone\)/g,
  'contacts(id, first_name, last_name, email, phone)'
);

fs.writeFileSync('src/app/api/crm/sync/route.ts', c);
console.log('Fixed contacts select');
