const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/\{\/\* Observa.*? \*\/\}[\s\S]*?<ContactNotes[\s\S]*?<\/div>\s*\}\)\s*<\/div>/g, '');
c = c.replace(/\{\/\* Notes \*\/\}[\s\S]*?<ContactNotes[\s\S]*?<\/div>\s*\}\)\s*<\/div>/g, '');

const infPessoais = `                             </div>
                          </div>
                        </div>`;

const formattedNotesBlock = `                        {/* Observacoes */}
                        <div>
                          <button onClick={() => toggleSection('notes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><FileText className="h-4 w-4 text-slate-400" /> Observacoes</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.notes ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.notes && (
                            <div className="mt-3 h-[300px] overflow-hidden flex flex-col">
                              <ContactNotes contactId={(profile as any).id || linkedContacts[activeChat.id]} currentUser={currentUser ? { name: currentUser.name, initials: currentUser.name.split(" ").length > 1 ? (currentUser.name.split(" ")[0][0] + currentUser.name.split(" ")[currentUser.name.split(" ").length-1][0]).toUpperCase() : currentUser.name.substring(0,2).toUpperCase() } : undefined} />
                            </div>
                          )}
                        </div>`;

c = c.replace(infPessoais, infPessoais + '\n\n' + formattedNotesBlock);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Cleaned duplicates and inserted Notes block');
