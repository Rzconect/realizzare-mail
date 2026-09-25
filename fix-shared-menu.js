const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const searchRegex = /<div className=\{\`absolute right-2 \$\{msgIndex >= activeChat\.messages\.length - 2 \? 'bottom-8' : 'top-8'\} w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden\`\}>/g;

const replacement = `<div className={\`absolute \${isMine ? 'right-2' : 'left-0'} \${msgIndex >= activeChat.messages.length - 2 ? 'bottom-8' : 'top-8'} w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden\`}>`;

c = c.replace(searchRegex, replacement);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed shared menu');
