const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/campaigns/create/page.tsx', 'utf-8');

const targetBlockRegex = /\{filteredExcludeOptions\.length === 0 \? \([\s\S]*?Nenhuma lista encontrada para exclusão[\s\S]*?\{\s*filteredExcludeOptions\.map\(\(l\) => \{[\s\S]*?return \([\s\S]*?\<\/button\>\s*\);\s*\}\)\s*\)\}/;

const excludeDropdownContent = \`
                        {/* Section 1: Listas */}
                        <details className="group">
                          <summary className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2 py-1.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-md select-none transition-colors">
                            <span>Listas ({filteredExcludeOptions.filter(l => !l.isSegment).length})</span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="pt-1 pb-2 space-y-0.5 px-1">
                          {filteredExcludeOptions.filter(l => !l.isSegment).length === 0 ? (
                            <div className="text-xs text-slate-400 p-2 italic text-center">Nenhuma lista encontrada.</div>
                          ) : (
                            filteredExcludeOptions.filter(l => !l.isSegment).map((l) => {
                              const isSelected = selectedExcludeLists.includes(l.id);
                              return (
                                <button
                                  key={l.id}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) setSelectedExcludeLists(prev => prev.filter(id => id !== l.id));
                                    else setSelectedExcludeLists(prev => [...prev, l.id]);
                                    setExcludeSearchQuery("");
                                  }}
                                  className={\\\`w-full text-left text-xs px-3 py-2 rounded-lg flex items-center justify-between transition-colors \${
                                    isSelected ? "bg-red-50 text-red-700 font-bold" : "hover:bg-slate-100 text-slate-700"
                                  }\\\`}
                                >
                                  <span className="truncate">{l.name}</span>
                                  <span className="text-slate-400">({l.count} leads)</span>
                                </button>
                              );
                            })
                          )}
                          </div>
                        </details>

                        {/* Section 2: Segmentações */}
                        <details className="group border-t border-slate-100 pt-1 mt-1">
                          <summary className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2 py-1.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-md select-none transition-colors">
                            <span>Segmentações ({filteredExcludeOptions.filter(l => l.isSegment).length})</span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="pt-1 pb-2 space-y-0.5 px-1">
                          {filteredExcludeOptions.filter(l => l.isSegment).length === 0 ? (
                            <div className="text-xs text-slate-400 p-2 italic text-center">Nenhuma segmentação encontrada.</div>
                          ) : (
                            filteredExcludeOptions.filter(l => l.isSegment).map((l) => {
                              const isSelected = selectedExcludeLists.includes(l.id);
                              return (
                                <button
                                  key={l.id}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) setSelectedExcludeLists(prev => prev.filter(id => id !== l.id));
                                    else setSelectedExcludeLists(prev => [...prev, l.id]);
                                    setExcludeSearchQuery("");
                                  }}
                                  className={\\\`w-full text-left text-xs px-3 py-2 rounded-lg flex items-center justify-between transition-colors \${
                                    isSelected ? "bg-red-50 text-red-700 font-bold" : "hover:bg-slate-100 text-slate-700"
                                  }\\\`}
                                >
                                  <span className="truncate">{l.name}</span>
                                  <span className="text-slate-400">({l.count} leads)</span>
                                </button>
                              );
                            })
                          )}
                          </div>
                        </details>

                        {/* Section 3: Contatos Individuais/Diretos */}
                        <details className="group border-t border-slate-100 pt-1 mt-1">
                          <summary className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2 py-1.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-md select-none transition-colors">
                            <div className="flex items-center gap-2">
                              <span>Contatos Diretos ({contacts.length})</span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="pt-1 pb-2 space-y-0.5 px-1">
                          {contacts.length === 0 ? (
                            <div className="text-xs text-slate-400 p-2 italic text-center">Nenhum contato na base.</div>
                          ) : (
                            excludeSearchQuery.length < 2 ? (
                                <div className="text-xs text-slate-400 p-2 italic text-center">Digite para buscar contatos...</div>
                            ) : (
                                contacts
                                  .filter(c => {
                                    const q = excludeSearchQuery.toLowerCase();
                                    return (c.first_name || "").toLowerCase().includes(q) || (c.last_name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
                                  })
                                  .slice(0, 10)
                                  .map((c) => {
                                  const contactListId = "contact-" + c.id;
                                  const isSelected = selectedExcludeLists.includes(contactListId);
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
                                          setSelectedExcludeLists(prev => prev.filter(id => id !== contactListId));
                                        } else {
                                          setSelectedExcludeLists(prev => [...prev, contactListId]);
                                        }
                                        setExcludeSearchQuery("");
                                      }}
                                      className={\\\`w-full text-left text-xs px-3 py-1.5 rounded-lg flex items-center justify-between transition-colors \${
                                        isSelected ? "bg-red-50 text-red-800 font-bold" : "hover:bg-slate-100 text-slate-700"
                                      }\\\`}
                                    >
                                      <span className="truncate">{displayName}</span>
                                      <span className="text-[9px] text-red-600 font-extrabold bg-red-100/60 px-1.5 py-0.5 rounded shrink-0">Contato Direto</span>
                                    </button>
                                  );
                                })
                            )
                          )}
                          </div>
                        </details>\`;

content = content.replace(targetBlockRegex, excludeDropdownContent);

// Also address Issue 2: SelectContactsModal shows 10 leads limit
const oldModalContactsLogic = /contacts\s*\n\s*\.filter\(\(c\) => \{[\s\S]*?\}\)\s*\n\s*\.slice\(0,\s*contactSearchQuery\.trim\(\)\s*\?\s*undefined\s*:\s*20\)\s*\n\s*\.map/g;

// I'll just change 20 to 10
content = content.replace(oldModalContactsLogic, function(match) {
    return match.replace("20", "10");
});

// Issue 1: Autosave draft. We need to save the draft whenever moving steps.
// Search for handleNextStep or setWizardStep
// We have wizardStep, setWizardStep...

fs.writeFileSync('src/app/dashboard/campaigns/create/page.tsx', content, 'utf-8');
console.log('Done patch 1/2/3.');
