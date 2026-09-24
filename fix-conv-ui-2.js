const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

// 1. Add accordion state if missing
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

// 2. Fix the name missing. It's currently removed because my previous script removed the Profile Header, but failed to insert it above Telefone!
// Let's check what's there.
const rightSidebarRegex = /(<div className="flex items-center gap-3 mb-2">[\s\S]*?<\/div>\s*)?<div className="space-y-6">([\s\S]*?)<UserIcon className="h-4 w-4 text-slate-400" \/>(.*?)\n\s*<\/h5>\s*<div className="space-y-2\.5 text-sm">/m;

const match = c.match(rightSidebarRegex);
if (match) {
  const replacement = `<div className="space-y-6">
                          {/* Dados do Aluno */}
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">
                              <UserIcon className="h-4 w-4 text-slate-400" /> Informações Pessoais
                            </h5>
                            <div className="space-y-2.5 text-sm">
                               <div className="flex items-center gap-3 mb-4 mt-2">
                                 <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                   {profile.first_name?.charAt(0) || ""}{profile.last_name?.charAt(0) || ""}
                                 </div>
                                 <h4 className="font-bold text-slate-800 text-sm truncate">{profile.first_name} {profile.last_name}</h4>
                               </div>`;
  c = c.replace(rightSidebarRegex, replacement);
}

// 3. Fix Cursos Matriculados
const cursosTarget = /<h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">\s*<BookOpen className="h-4 w-4 text-slate-400" \/>(.*?)<\/h5>/;
const cursosReplace = `<button onClick={() => toggleSection('cursos')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-slate-400" /> Cursos Matriculados</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.cursos ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.cursos && (`;
c = c.replace(cursosTarget, cursosReplace);

// 4. Fix Últimas Transações
const ultimasTarget = /<\/div>\s*<div>\s*<h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">\s*<DollarSign className="h-4 w-4 text-slate-400" \/>(.*?)<\/h5>/;
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
const linhaTarget = /<\/div>\s*<div>\s*<h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">\s*<Clock className="h-4 w-4 text-slate-400" \/>(.*?)<\/h5>/;
const linhaReplace = `)}
                        </div>
                        <div>
                          <button onClick={() => toggleSection('timeline')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /> Linha do Tempo</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.timeline ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.timeline && (`;
c = c.replace(linhaTarget, linhaReplace);

// 6. Close Timeline and add Notes
const endTarget = /Nenhum evento registrado.<\/p>\s*\}?\s*\)?\s*<\/div>/;
const endReplace = `Nenhum evento registrado.</p>
                            )}
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <button onClick={() => toggleSection('notes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><FileText className="h-4 w-4 text-slate-400" /> Observações</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.notes ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.notes && (
                            <div className="h-[300px]">
                              <ContactNotes contactId={profile.id} />
                            </div>
                          )}
                        </div>`;
if (!c.includes('<ContactNotes contactId={profile.id} />')) {
  c = c.replace(endTarget, endReplace);
}

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Conversations page fixed');
