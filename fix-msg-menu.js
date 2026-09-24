const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

if (!c.includes('activeMessageMenu')) {
  c = c.replace(
    'const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);',
    'const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);\n    const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);'
  );
}

// Add the chevron button inside the message bubble.
// For bot messages:
c = c.replace(
  /<div className="flex items-center justify-end gap-1 mt-1">\s*<span className="text-\[9px\] font-semibold text-slate-400">\{msg\.time\}<\/span>\s*<\/div>/g,
  `<div className="flex items-center justify-end gap-1 mt-1">
    <span className="text-[9px] font-semibold text-slate-400">{msg.time}</span>
  </div>
  <button onClick={() => setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id)} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-0.5 rounded-full shadow-sm text-slate-500 hover:text-slate-800">
    <ChevronDown className="h-3.5 w-3.5" />
  </button>
  {activeMessageMenu === msg.id && (
    <>
      <div className="fixed inset-0 z-20" onClick={() => setActiveMessageMenu(null)}></div>
      <div className="absolute right-2 top-8 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
        <button onClick={() => { setActiveMessageMenu(null); alert("Responder ainda não implementado na API local."); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Responder</button>
        <button onClick={() => { setActiveMessageMenu(null); alert("Apagar mensagem ainda não implementado na API local."); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Apagar mensagem</button>
      </div>
    </>
  )}`
);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Added message menu shell');
