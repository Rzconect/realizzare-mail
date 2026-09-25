const fs = require('fs');

const path = 'src/app/dashboard/conversations/page.tsx';
let c = fs.readFileSync(path, 'utf8');

// Restore Cursos
const cursosTarget = /{panelConfig\.openState\.cursos && \([\s\S]*?<div className="mt-3">[\s\S]*?\{\(profile as any\)\.cursos[\s\S]*?Nenhum curso matriculado\.<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>\s*\)\s*\}/;

const cursosReplacement = `{panelConfig.openState.cursos && (
                                  <div className="mt-3">
                                    {(profile as any).enrollments && (profile as any).enrollments.length > 0 ? (
                                      <div className="space-y-2">
                                        {(profile as any).enrollments.slice(0, 3).map((e: any, i: number) => (
                                          <div key={i} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm flex flex-col gap-1.5">
                                             <span className="text-xs font-bold text-slate-700 leading-tight truncate">{e.course_name}</span>
                                             <div className="flex items-center justify-between">
                                               <span className="text-slate-500 text-[10px]">Progresso: <strong className="text-slate-700">{e.progress}%</strong></span>
                                               <span className={\`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase \${e.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}\`}>
                                                 {e.status === 'completed' ? 'Concluído' : 'Ativo'}
                                               </span>
                                             </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhum curso matriculado.</p>
                                    )}
                                  </div>
                                )}`;

c = c.replace(cursosTarget, cursosReplacement);

// Restore Transacoes
const transacoesTarget = /{panelConfig\.openState\.transacoes && \([\s\S]*?<div className="mt-3">[\s\S]*?\{\(profile as any\)\.transacoes[\s\S]*?Nenhuma transação encontrada\.<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>\s*\)\s*\}/;

const transacoesReplacement = `{panelConfig.openState.transacoes && (
                                  <div className="mt-3">
                                    {(profile as any).purchases && (profile as any).purchases.length > 0 ? (
                                      <div className="space-y-2">
                                        {[...((profile as any).purchases || [])].sort((a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime()).slice(0, 3).map((p: any, i: number) => (
                                          <div key={i} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm flex justify-between items-center gap-2">
                                            <div className="min-w-0 flex-1">
                                              <span className="text-xs font-bold text-slate-700 block truncate">{p.product_name}</span>
                                              <span className="text-[10px] text-slate-400">{formatTransactionDate(p.paid_at, p.product_type)}</span>
                                            </div>
                                            <div className="text-right shrink-0">
                                              <span className={\`text-[10px] font-bold block \${p.status === 'paid' ? 'text-emerald-600' : p.status === 'refunded' ? 'text-red-500' : 'text-orange-500'}\`}>
                                                R$ {(p.amount / 100).toFixed(2).replace('.', ',')}
                                              </span>
                                              <span className="text-[9px] text-slate-400 capitalize">{p.payment_method === 'credit_card' ? 'Cartão' : p.payment_method}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhuma transação encontrada.</p>
                                    )}
                                  </div>
                                )}`;

c = c.replace(transacoesTarget, transacoesReplacement);

// Restore Timeline
const timelineTarget = /{panelConfig\.openState\.timeline && \([\s\S]*?<div className="mt-3">[\s\S]*?\{\(profile as any\)\.timeline[\s\S]*?Nenhum evento registrado\.<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>\s*\)\s*\}/;

const timelineReplacement = `{panelConfig.openState.timeline && (
                                  <div className="mt-3">
                                    {(profile as any).timeline && (profile as any).timeline.length > 0 ? (
                                      <div className="relative border-l-2 border-slate-200 ml-2 space-y-4 pb-2 mt-3">
                                        {(profile as any).timeline.slice(0, 3).map((t: any, i: number) => (
                                          <div key={i} className="relative pl-4">
                                            <div className="absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-white border-2 border-indigo-500" />
                                            <span className="text-xs font-bold text-slate-700 block leading-tight">{t.label}</span>
                                            <span className="text-[10px] text-slate-500 block leading-tight mt-1">{t.details}</span>
                                            <span className="text-[9px] text-slate-400 block mt-1">{formatTimelineTimestamp(t.timestamp)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhum evento registrado.</p>
                                    )}
                                  </div>
                                )}`;

c = c.replace(timelineTarget, timelineReplacement);

fs.writeFileSync(path, c);
console.log('Restored original block structure');
