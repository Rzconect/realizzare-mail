const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/<div ref=\{messagesEndRef\} className="pb-40" \/>/g, '<div ref={messagesEndRef} className="pb-4" />');

c = c.replace(/\{activeChat\.messages\.map\(\(msg: any\) => \{/g, '{activeChat.messages.map((msg: any, msgIndex: number) => {');

const targetMenu = `<div className="absolute right-2 top-8 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">`;

const replacementMenu = `<div className={\`absolute right-2 \${msgIndex >= activeChat.messages.length - 2 ? 'bottom-8' : 'top-8'} w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden\`}>`;

c = c.replace(targetMenu, replacementMenu);
c = c.replace(targetMenu, replacementMenu); // Do it twice because there is one for isMine and one for !isMine

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed padding and menu position');
