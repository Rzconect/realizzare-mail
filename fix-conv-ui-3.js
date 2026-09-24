const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

// 3. Fix Cursos Matriculados
const cursosTarget = /<h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">[\s\S]*?<BookOpen className="h-4 w-4 text-slate-400" \/>[\s\S]*?<\/h5>/;
const cursosReplace = `<button onClick={() => toggleSection('cursos')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-slate-400" /> Cursos Matriculados</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.cursos ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.cursos && (`;
c = c.replace(cursosTarget, cursosReplace);

// 4. Fix Últimas Transações
const ultimasTarget = /<\/div>\s*<div>\s*<h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">[\s\S]*?<DollarSign className="h-4 w-4 text-slate-400" \/>[\s\S]*?<\/h5>/;
const ultimasReplace = `)}
                        </div>
                        <div>
                          <button onClick={() => toggleSection('transacoes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-slate-400" /> Últimas Transações</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.transacoes ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.transacoes && (`;
c = c.replace(ultimasTarget, ultimasReplace);

// 5. Fix Linha do Tempo
const linhaTarget = /<\/div>\s*<div>\s*<h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">[\s\S]*?<Clock className="h-4 w-4 text-slate-400" \/>[\s\S]*?<\/h5>/;
const linhaReplace = `)}
                        </div>
                        <div>
                          <button onClick={() => toggleSection('timeline')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /> Linha do Tempo</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.timeline ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.timeline && (`;
c = c.replace(linhaTarget, linhaReplace);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Conversations page fixed');
