const fs = require('fs');
let lines = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8').split(/\r?\n/);

let idx = lines.findIndex(l => l.includes('import {') && l.includes('lucide-react'));
if (idx !== -1 && !lines[idx].includes('FileText')) {
    lines[idx] = lines[idx].replace('}', ', FileText }');
}

let idx2 = lines.findIndex(l => l.includes('import { createClient }'));
if (idx2 !== -1) {
    let hasNotes = lines.some(l => l.includes('import ContactNotes'));
    if (!hasNotes) {
        lines.splice(idx2+1, 0, 'import ContactNotes from "@/components/crm/ContactNotes";');
    }
}

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', lines.join('\n'));
console.log('Fixed imports!');
