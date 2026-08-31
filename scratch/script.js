
const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/campaigns/create/page.tsx", "utf8");

const regex = /\{\/\* Section 3: Contatos Individuais\/Diretos \*\/\}[\s\S]*?\{\/\* Footer Action Button \*\/\}/g;

const newSection3 = `
                        {/* Section 3: Contatos Individuais/Diretos */}
                        <details className="group border-t border-slate-100 pt-1 mt-1">
                          <summary className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2 py-1.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-md select-none transition-colors">
                            <div className="flex items-center gap-2">
                              <span>Contatos Diretos ({contacts.length})</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setShowIncludeDropdown(false);
                                  setShowSelectContactsModal(true);
                                }}
                                className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 underline ml-2"
                              >
                                Ver Todos
                              </button>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="pt-1 pb-2 space-y-0.5 px-1">
                          {contacts.length === 0 ? (
                            <div className="text-xs text-slate-400 p-2 italic text-center">Nenhum contato na base.</div>
                          ) : (
                            includeSearchQuery.length < 2 ? (
                                <div className="text-xs text-slate-400 p-2 italic text-center">Digite para buscar contatos específicos...</div>
                            ) : (
                                contacts
                                  .filter(c => {
                                    const q = includeSearchQuery.toLowerCase();
                                    return (c.first_name || "").toLowerCase().includes(q) || (c.last_name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
                                  })
                                  .slice(0, 5)
                                  .map((c) => {
                                  const contactListId = "contact-" + c.id;
                                  const isSelected = selectedIncludeLists.includes(contactListId);
                                  const displayName = c.name || c.email;
                                  return (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => {
                                        setListsList(prev => {
                                          if (prev.some(item => item.id === contactListId)) return prev;
                                          return [...prev, { id: contactListId, name: displayName, count: 1 }];
                                        });
                                        if (isSelected) {
                                          setSelectedIncludeLists(prev => prev.filter(id => id !== contactListId));
                                        } else {
                                          setSelectedIncludeLists(prev => [...prev, contactListId]);
                                        }
                                        setIncludeSearchQuery("");
                                      }}
                                      className={\`w-full text-left text-xs px-3 py-1.5 rounded-lg flex items-center justify-between transition-colors \${
                                        isSelected ? "bg-emerald-50 text-emerald-800 font-bold" : "hover:bg-slate-100 text-slate-700"
                                      }\`}
                                    >
                                      <span className="truncate">{displayName}</span>
                                      <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-100/60 px-1.5 py-0.5 rounded shrink-0">Contato Direto</span>
                                    </button>
                                  );
                                })
                            )
                          )}
                          </div>
                        </details>
                        
                        {/* Footer Action Button */}
`;

if (content.match(regex)) {
  content = content.replace(regex, newSection3);
  fs.writeFileSync("src/app/dashboard/campaigns/create/page.tsx", content, "utf8");
  console.log("Fixed Section 3");
} else {
  console.log("Could not find regex for Section 3");
}

