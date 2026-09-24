const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

// 1. Move name from Profile Header to Informações Pessoais
const profileHeaderRegex = /\{\/\* Profile Header \*\/\}[\s\S]*?<div className="space-y-6">/;
const newProfileHeader = `<div className="space-y-6">`;
c = c.replace(profileHeaderRegex, newProfileHeader);

const infoPessoaisTarget = `<div className="space-y-2.5 text-sm">
                             <div className="flex justify-between items-center">`;
const infoPessoaisReplace = `<div className="space-y-2.5 text-sm">
                             <div className="flex items-center gap-3 mb-4">
                               <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                 {profile.first_name?.charAt(0) || ""}{profile.last_name?.charAt(0) || ""}
                               </div>
                               <h4 className="font-bold text-slate-800 text-sm truncate">{profile.first_name} {profile.last_name}</h4>
                             </div>
                             <div className="flex justify-between items-center">`;
c = c.replace(infoPessoaisTarget, infoPessoaisReplace);

// 2. Add accordion states
if (!c.includes('const [openSections, setOpenSections]')) {
  c = c.replace(
    'const [linkedContacts, setLinkedContacts]',
    `const [openSections, setOpenSections] = useState<Record<string, boolean>>({ notes: true });\n  const [linkedContacts, setLinkedContacts]`
  );
  
  c = c.replace(
    'const toggleContactDetails',
    `const toggleSection = (sec: string) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));\n  const toggleContactDetails`
  );
}

// 3. Transform sections to accordion
// Cursos Matriculados
const cursosTarget = `<h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">
                            <BookOpen className="h-4 w-4 text-slate-400" /> Cursos Matriculados
                          </h5>`;
const cursosReplace = `<button onClick={() => toggleSection('cursos')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-slate-400" /> Cursos Matriculados</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.cursos ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.cursos && (`;

c = c.replace(cursosTarget, cursosReplace);

// We need to close the conditional block for Cursos Matriculados. It ends before Últimas Transações.
const ultimasTarget = `<div>
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">
                            <DollarSign className="h-4 w-4 text-slate-400" /> Últimas Transações`;
const ultimasReplace = `)}
                        </div>
                        <div>
                          <button onClick={() => toggleSection('transacoes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-slate-400" /> Últimas Transações</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.transacoes ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.transacoes && (`;
c = c.replace(ultimasTarget, ultimasReplace);

// Close block for Últimas Transações, which ends before Linha do Tempo
const linhaTarget = `<div>
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">
                            <Clock className="h-4 w-4 text-slate-400" /> Linha do Tempo`;
const linhaReplace = `)}
                        </div>
                        <div>
                          <button onClick={() => toggleSection('timeline')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /> Linha do Tempo</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.timeline ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.timeline && (`;
c = c.replace(linhaTarget, linhaReplace);

const endTarget = `) : (
                              <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhum evento registrado.</p>
                            )}
                          </div>`;
const endReplace = `) : (
                              <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhum evento registrado.</p>
                            )}
                          )}
                        </div>`;
c = c.replace(endTarget, endReplace);


fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Conversations page UI updated for Accordions');
