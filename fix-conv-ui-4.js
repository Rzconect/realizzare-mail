const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const endTarget = /Nenhum evento registrado\.<\/p>\s*\}\)\s*<\/div>\s*<\/div>/;
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
  c = c.replace(/Nenhum evento registrado\.<\/p>[\s\S]*?<\/div>\s*<\/div>/, `Nenhum evento registrado.</p>
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
                        </div>`);
}

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Conversations page notes fixed');
