const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/<div key=\{msgIndex\} className=\{(.*?)\}>/g, '<div key={msgIndex} id={`msg-${msg.messageId || msg.id}`} className={$1}>');

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Added msg IDs');
