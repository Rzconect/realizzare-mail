const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const clientMenuRegex = /<div className=\{\`absolute right-2 \$\{msgIndex >= activeChat\.messages\.length - 2 \? 'bottom-8' : 'top-8'\} w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden\`\}>/g;

// I will just replace the first match which is the client message menu
let matchCount = 0;
c = c.replace(clientMenuRegex, (match) => {
  matchCount++;
  if (matchCount === 1) {
    return `<div className={\`absolute left-0 \${msgIndex >= activeChat.messages.length - 2 ? 'bottom-8' : 'top-8'} w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden\`}>`;
  }
  return match;
});

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed context menu position');
