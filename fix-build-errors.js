const fs = require('fs');

let crmCode = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');
crmCode = crmCode.replace(/\\n\s+if \(selectedDeal/g, '\n    if (selectedDeal');
fs.writeFileSync('src/app/dashboard/crm/page.tsx', crmCode);

let convCode = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');
convCode = convCode.replace(/const \[replyingTo, setReplyingTo\] = useState<any \| null>\(null\);\n/g, '');
fs.writeFileSync('src/app/dashboard/conversations/page.tsx', convCode);

console.log('Fixed build errors');
