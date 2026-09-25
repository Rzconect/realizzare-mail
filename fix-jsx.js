const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/return \(\s*\{msg\.isQuoted && \(/g, `return (
  <>
    {msg.isQuoted && (`);

c = c.replace(/<p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">\{msg\.text\}<\/p>\s*\);/g, `<p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
  </>
);`);

c = c.replace(/<p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">\{msg\.text\}<\/p>\s*\);/g, `<p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
  </>
);`);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed React Fragments');
