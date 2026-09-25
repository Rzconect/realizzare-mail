const fs = require('fs');

const path = 'src/app/dashboard/conversations/page.tsx';
let c = fs.readFileSync(path, 'utf8');

// 1. Add State variables
const stateTarget = `const [openSections, setOpenSections] = useState<Record<string, boolean>>({ notes: true });
  const toggleSection = (sec: string) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));`;

const stateReplacement = `  const [panelConfig, setPanelConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('realizzare_contact_panel_config');
      if (saved) return JSON.parse(saved);
    }
    return {
      order: ["personal", "cursos", "transacoes", "timeline", "notes"],
      openState: { personal: true, cursos: false, transacoes: false, timeline: false, notes: false }
    };
  });
  const [isPanelConfigOpen, setIsPanelConfigOpen] = useState(false);

  const toggleSection = (sec: string) => {
    setPanelConfig(prev => {
      const next = { ...prev, openState: { ...prev.openState, [sec]: !prev.openState[sec] } };
      if (typeof window !== 'undefined') localStorage.setItem('realizzare_contact_panel_config', JSON.stringify(next));
      return next;
    });
  };

  const movePanelSection = (index: number, direction: number) => {
    setPanelConfig(prev => {
      const newOrder = [...prev.order];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newOrder.length) return prev;
      const temp = newOrder[index];
      newOrder[index] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;
      const next = { ...prev, order: newOrder };
      if (typeof window !== 'undefined') localStorage.setItem('realizzare_contact_panel_config', JSON.stringify(next));
      return next;
    });
  };`;

c = c.replace(stateTarget, stateReplacement);

// 2. Add Settings Button
const btnTarget = `<button title="Desvincular contato" onClick={() => {
                    setLinkedContacts(prev => {
                      const next = { ...prev };
                      delete next[activeChat.id];
                      localStorage.setItem("realizzare_chat_contacts", JSON.stringify(next));
                      return next;
                    });
                  }}>
                    <Unlink className="h-4 w-4 text-red-400 hover:text-red-600 cursor-pointer transition-colors" />
                  </button></div>`;

const btnReplacement = `<button title="Desvincular contato" onClick={() => {
                    setLinkedContacts(prev => {
                      const next = { ...prev };
                      delete next[activeChat.id];
                      localStorage.setItem("realizzare_chat_contacts", JSON.stringify(next));
                      return next;
                    });
                  }}>
                    <Unlink className="h-4 w-4 text-red-400 hover:text-red-600 cursor-pointer transition-colors" />
                  </button>
                  <button title="Configurar Painel" onClick={() => setIsPanelConfigOpen(true)}>
                    <Settings className="h-4 w-4 text-slate-400 hover:text-indigo-600 transition-colors" />
                  </button>
                  </div>`;

c = c.replace(btnTarget, btnReplacement);

// 3. Replace the actual layout
const layoutTargetRegex = /<\s*div\s+className="space-y-6"\s*>[\s\S]*?(?=<\/\s*div\s*>\s*<\/\s*>\s*\);\s*\}\)\(\)\s*\)\s*:\s*\()/;

const layoutReplacement = `<div className="space-y-6">
                        {(() => {
                          const blocks: Record<string, React.ReactNode> = {
                            personal: (
                              <div key="personal">
                                <button onClick={() => toggleSection('personal')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                  <div className="flex items-center gap-1"><UserIcon className="h-4 w-4 text-slate-400" /> Informações Pessoais</div>
                                  <ChevronDown className={\`h-4 w-4 transition-transform \${panelConfig.openState.personal ? 'rotate-180' : ''}\`} />
                                </button>
                                {panelConfig.openState.personal && (
                                  <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-xs shrink-0">Nome:</span>
                                        <span className="font-medium text-slate-700 text-right text-xs ml-2" title={\`\${profile.first_name} \${profile.last_name || ''}\`.trim() || 'Sem Nome'}>
                                          {\`\${profile.first_name} \${profile.last_name || ''}\`.trim().length > 38 ? \`\${profile.first_name} \${profile.last_name || ''}\`.trim().substring(0, 38) + '...' : \`\${profile.first_name} \${profile.last_name || ''}\`.trim() || 'Sem Nome'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-xs">Telefone:</span>
                                        <span className="font-medium text-slate-700 text-right text-xs">{profile.phone || "Não informado"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-xs">E-mail:</span>
                                        <span className="font-medium text-slate-700 text-right text-xs break-all" title={profile.email}>{profile.email || "Não informado"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-xs">Cidade:</span>
                                        <span className="font-medium text-slate-700 text-right text-xs">{profile.city || "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-xs">Estado:</span>
                                        <span className="font-medium text-slate-700 text-right text-xs">{profile.state || "-"}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ),
                            notes: (
                              <div key="notes" className="flex flex-col">
                                <button onClick={() => toggleSection('notes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                  <div className="flex items-center gap-1"><FileText className="h-4 w-4 text-slate-400" /> Observações</div>
                                  <ChevronDown className={\`h-4 w-4 transition-transform \${panelConfig.openState.notes ? 'rotate-180' : ''}\`} />
                                </button>
                                {panelConfig.openState.notes && (
                                  <div className="mt-3 h-[300px] flex flex-col relative overflow-hidden bg-white/50 rounded-xl border border-slate-100 p-2">
                                    <ContactNotes contactId={(profile as any).id || linkedContacts[activeChat.id]} currentUser={currentUser ? { name: currentUser.name, initials: currentUser.name.split(" ").length > 1 ? (currentUser.name.split(" ")[0][0] + currentUser.name.split(" ")[currentUser.name.split(" ").length-1][0]).toUpperCase() : currentUser.name.substring(0,2).toUpperCase() } : undefined} />
                                  </div>
                                )}
                              </div>
                            ),
                            cursos: (
                              <div key="cursos">
                                <button onClick={() => toggleSection('cursos')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                  <div className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-slate-400" /> Cursos Matriculados</div>
                                  <ChevronDown className={\`h-4 w-4 transition-transform \${panelConfig.openState.cursos ? 'rotate-180' : ''}\`} />
                                </button>
                                {panelConfig.openState.cursos && (
                                  <div className="mt-3">
                                    {(profile as any).cursos && (profile as any).cursos.length > 0 ? (
                                      <div className="space-y-2">
                                        {(profile as any).cursos.map((c: any, i: number) => (
                                          <div key={i} className="bg-slate-100 p-2 rounded-lg border border-slate-200/60">
                                            <p className="text-xs font-bold text-slate-700">{c.nome}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">Concluído: {c.progresso || '0'}%</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhum curso matriculado.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ),
                            transacoes: (
                              <div key="transacoes">
                                <button onClick={() => toggleSection('transacoes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                  <div className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-slate-400" /> Últimas Transações</div>
                                  <ChevronDown className={\`h-4 w-4 transition-transform \${panelConfig.openState.transacoes ? 'rotate-180' : ''}\`} />
                                </button>
                                {panelConfig.openState.transacoes && (
                                  <div className="mt-3">
                                    {(profile as any).transacoes && (profile as any).transacoes.length > 0 ? (
                                      <div className="space-y-2">
                                        {(profile as any).transacoes.map((t: any, i: number) => (
                                          <div key={i} className="flex items-center justify-between bg-slate-100 p-2 rounded-lg border border-slate-200/60">
                                            <div>
                                              <p className="text-xs font-bold text-slate-700">{t.produto}</p>
                                              <p className="text-[10px] text-slate-500">{t.data}</p>
                                            </div>
                                            <span className={\`text-xs font-bold \${t.status === 'Pago' ? 'text-emerald-600' : 'text-orange-500'}\`}>{t.valor}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhuma transação encontrada.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ),
                            timeline: (
                              <div key="timeline">
                                <button onClick={() => toggleSection('timeline')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                  <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /> Linha do Tempo</div>
                                  <ChevronDown className={\`h-4 w-4 transition-transform \${panelConfig.openState.timeline ? 'rotate-180' : ''}\`} />
                                </button>
                                {panelConfig.openState.timeline && (
                                  <div className="mt-3">
                                    {(profile as any).timeline && (profile as any).timeline.length > 0 ? (
                                      <div className="relative border-l-2 border-slate-200 ml-2 pl-4 py-2 space-y-4">
                                        {(profile as any).timeline.map((t: any, i: number) => (
                                          <div key={i} className="relative">
                                            <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500 border-2 border-slate-50"></div>
                                            <p className="text-xs font-medium text-slate-700">{t.action}</p>
                                            <span className="text-[9px] text-slate-400 block mt-1">{formatTimelineTimestamp(t.timestamp)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhum evento registrado.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          };
                          
                          return panelConfig.order.map(key => blocks[key]);
                        })()}
                        `;

c = c.replace(layoutTargetRegex, layoutReplacement);

fs.writeFileSync(path, c);
console.log('Layout replaced');
