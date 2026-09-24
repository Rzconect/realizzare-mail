const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');
c = c.replace('import { FileText } from "lucide-react";', '');
fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
