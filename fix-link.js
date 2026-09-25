const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

c = c.replace(
  /href=\{\`\/dashboard\/contacts\`\}/g,
  'href={`/dashboard/contacts/${lead.id}`}'
);

fs.writeFileSync('src/components/FlowCanvas.tsx', c);
console.log('Fixed link');
