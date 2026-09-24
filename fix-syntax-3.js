const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(
  /<h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">\s*<DollarSign className="h-4 w-4 text-slate-400" \/>[^<]*<\/h5>/,
  `<button onClick={() => toggleSection('transacoes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
    <div className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-slate-400" /> Últimas Transações</div>
    <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.transacoes ? 'rotate-180' : ''}\`} />
  </button>
  {openSections.transacoes && (<>`
);

c = c.replace(
  /<div className="h-20 flex items-center justify-center text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-xl">\s*Nenhuma transa[^<]*<\/div>\s*\)\}\s*<\/div>/,
  '<div className="h-20 flex items-center justify-center text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-xl">Nenhuma transação encontrada.</div>)}</>)}</div>'
);

c = c.replace(
  /<h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">\s*<Clock className="h-4 w-4 text-slate-400" \/>[^<]*<\/h5>/,
  `<button onClick={() => toggleSection('timeline')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
    <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /> Linha do Tempo</div>
    <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.timeline ? 'rotate-180' : ''}\`} />
  </button>
  {openSections.timeline && (<>`
);

c = c.replace(
  /<p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100\/50 rounded-lg border border-slate-200\/50">Nenhum evento registrado\.<\/p>\s*\)\}\s*<\/div>/,
  '<p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhum evento registrado.</p>)}</>)}</div>'
);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed syntax 3');
