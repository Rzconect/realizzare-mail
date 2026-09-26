const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

// Find where the "draft" is first constructed with real data (the profile builder)
const search = 'const draft = {';
let idx = c.indexOf(search);
while (idx !== -1) {
  console.log('At', idx, ':');
  console.log(c.substring(idx, idx+3000));
  console.log('===');
  idx = c.indexOf(search, idx+1);
}
