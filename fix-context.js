const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(
  /className=\{`max-w-\[75%\] lg:max-w-\[60%\] rounded-2xl px-4 py-2\.5 shadow-sm relative group \$\{/g,
  `onContextMenu={(e) => { e.preventDefault(); setActiveMessageMenu(msg.id); }}\n                      className={\`max-w-[75%] lg:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm relative group \${`
);

// also for the bot message:
c = c.replace(
  /<div className="max-w-\[75%\] lg:max-w-\[60%\] rounded-2xl rounded-tl-none px-4 py-2\.5 shadow-sm relative group bg-indigo-50 border border-indigo-100">/g,
  '<div onContextMenu={(e) => { e.preventDefault(); setActiveMessageMenu(msg.id); }} className="max-w-[75%] lg:max-w-[60%] rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm relative group bg-indigo-50 border border-indigo-100">'
);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Added onContextMenu');
