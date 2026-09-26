const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(
  'order: ["personal", "cursos", "transacoes", "timeline", "notes"]',
  'order: ["personal", "cursos", "automacoes", "transacoes", "timeline", "notes"]'
);
c = c.replace(
  'openState: { personal: true, cursos: false, transacoes: false, timeline: false, notes: false }',
  'openState: { personal: true, cursos: false, automacoes: false, transacoes: false, timeline: false, notes: false }'
);

const automacoesBlock = `                            automacoes: (
                              <div key="automacoes">
                                <button onClick={() => toggleSection('automacoes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                  <div className="flex items-center gap-1"><GitBranch className="h-4 w-4 text-slate-400" /> Fluxos de Automação</div>
                                  <ChevronDown className={\`h-4 w-4 transition-transform \${panelConfig.openState.automacoes ? 'rotate-180' : ''}\`} />
                                </button>
                                {panelConfig.openState.automacoes && (
                                  <div className="mt-3">
                                    {(profile as any).flows && (profile as any).flows.length > 0 ? (
                                      <div className="space-y-2">
                                        {(profile as any).flows.map((f: any, i: number) => (
                                          <div key={i} className="bg-slate-100 p-2 rounded-lg border border-slate-200/60">
                                            <div className="flex items-center justify-between">
                                              <p className="text-xs font-bold text-slate-700 leading-tight">{f.name}</p>
                                              <span className={\`text-[9px] px-1.5 py-0.5 rounded font-bold \${
                                                f.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                              }\`}>
                                                {f.status === 'active' ? 'EM ANDAMENTO' : 'CONCLUÍDO'}
                                              </span>
                                            </div>
                                            {f.status === 'active' && (
                                              <div className="mt-1.5">
                                                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                                                  <div className="h-1 bg-indigo-500 rounded-full transition-all" style={{ width: \`\${f.progress || 50}%\` }} />
                                                </div>
                                              </div>
                                            )}
                                            {f.entered_at && (
                                              <p className="text-[10px] text-slate-500 mt-1">Entrou em: {new Date(f.entered_at).toLocaleDateString('pt-BR')}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhum fluxo ativo.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ),`;

c = c.replace('                            transacoes: (', automacoesBlock + '\n                            transacoes: (');

c = c.replace(
  "sec === 'personal' ? 'Info Pessoais' : sec === 'cursos' ? 'Cursos' : sec === 'transacoes' ? 'Transações' : sec === 'timeline' ? 'Linha do Tempo' : 'Observações'",
  "sec === 'personal' ? 'Info Pessoais' : sec === 'cursos' ? 'Cursos' : sec === 'automacoes' ? 'Fluxos de Automação' : sec === 'transacoes' ? 'Transações' : sec === 'timeline' ? 'Linha do Tempo' : 'Observações'"
);

if (!c.includes('GitBranch')) {
  c = c.replace('import { Search', 'import { GitBranch, Search');
}

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('done!');
