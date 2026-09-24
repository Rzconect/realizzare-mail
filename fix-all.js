const fs = require('fs');
const code = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const regex = /return\s*\(\s*<>\s*<div className="space-y-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/>\s*\);\s*\}\)\(\)\s*\)\s*:\s*\(/;

const newCode = `return (
                    <>
                      <div className="space-y-6">
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
                                <span className="font-medium text-slate-700 text-right text-xs">{profile.location?.city || "Não informada"}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-xs">Estado:</span>
                                <span className="font-medium text-slate-700 text-right text-xs">{profile.location?.state || "-"}</span>
                             </div>
                          </div>
                        </div>

                        {/* Cursos */}
                        <div>
                          <button onClick={() => toggleSection('cursos')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-slate-400" /> Cursos Matriculados</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.cursos ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.cursos && (
                            <div className="mt-3">
                              {profile.enrollments && profile.enrollments.length > 0 ? (
                                <div className="space-y-2">
                                  {profile.enrollments.slice(0, 3).map((e: any, i: number) => (
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
                                <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhuma matrícula encontrada.</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Transações */}
                        <div>
                          <button onClick={() => toggleSection('transacoes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-slate-400" /> Últimas Transações</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.transacoes ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.transacoes && (
                            <div className="mt-3">
                              {profile.purchases && profile.purchases.length > 0 ? (
                                <div className="space-y-2">
                                  {[...(profile.purchases || [])].sort((a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime()).slice(0, 3).map((p: any, i: number) => (
                                    <div key={i} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm flex justify-between items-center gap-2">
                                      <div className="min-w-0 flex-1">
                                        <span className="text-xs font-bold text-slate-700 block truncate">{p.product_name}</span>
                                        <span className="text-[10px] text-slate-400">{formatTransactionDate(p.paid_at, p.product_type)}</span>
                                      </div>
                                      <div className="text-right shrink-0">
                                         <span className="text-xs font-bold text-emerald-600 block">R$ {p.amount.toFixed(2).replace('.', ',')}</span>
                                         <span className="text-[9px] font-semibold text-emerald-500 uppercase">Pago</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">Nenhuma transação encontrada.</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Timeline */}
                        <div>
                          <button onClick={() => toggleSection('timeline')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /> Linha do Tempo</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.timeline ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.timeline && (
                            <div className="mt-3">
                              {profile.timeline && profile.timeline.length > 0 ? (
                                <div className="relative border-l-2 border-slate-200 ml-2 space-y-4 pb-2 mt-3">
                                  {profile.timeline.slice(0, 3).map((t: any, i: number) => (
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
                          )}
                        </div>

                        {/* Notes */}
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
                        </div>

                      </div>
                    </>
                  );
                })()
              ) : (`;

const finalCode = code.replace(regex, newCode);
fs.writeFileSync('src/app/dashboard/conversations/page.tsx', finalCode);
console.log('Fixed everything properly');
