const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(/import \{.*?\} from "lucide-react";/, match => {
  if (!match.includes('FileText')) {
    return match.replace('}', ', FileText }');
  }
  return match;
});

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Added FileText import');
