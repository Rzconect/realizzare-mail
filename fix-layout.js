const fs = require('fs');
let c = fs.readFileSync('src/components/crm/DealModal.tsx', 'utf8');

let newLayout = `              {/* Custom Fields Section */}
              <div className="py-2 mt-2">
                <button 
                  onClick={() => setIsCustomFieldsOpen(!isCustomFieldsOpen)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors w-full mb-3 outline-none"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider flex-1 text-left">Detalhes do Contato</span>
                  <ChevronDown className={\`h-4 w-4 transition-transform \${isCustomFieldsOpen ? 'rotate-180' : ''}\`} />
                </button>

                {isCustomFieldsOpen && (
                  <div className="animate-fadeIn">
                    {duplicateProfilesCount > 1 && (
                      <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-700 p-2.5 rounded-lg text-[10px] font-medium flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">⚠️</span>
                        <span>
                          O número de telefone deste contato ({deal?.phone}) está vinculado a {duplicateProfilesCount} perfis diferentes na base.
                          <br/>
                          Exibindo dados do perfil mais recente.
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="col-span-2">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Nome Completo</label>
                        <input readOnly type="text" value={deal?.clientName || ''} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                        <input readOnly type="text" value={deal?.phone || contactData?.phone || ''} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">E-mail</label>
                        <input readOnly type="email" value={contactData?.email || deal?.email || ''} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Data de Cadastro</label>
                        <input readOnly type="text" value={contactData?.created_at ? new Date(contactData.created_at).toLocaleDateString('pt-BR') : ''} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">ID do Perfil</label>
                        <input readOnly type="text" value={contactData?.id || ''} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                      </div>
                    </div>
                    {contactData?.id && (
                      <div className="mt-3 flex justify-end">
                        <Link 
                          href={\`/dashboard/contacts/\${contactData.id}\`}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg"
                        >
                          Ver ficha completa
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 bg-white p-5 rounded-xl shadow-sm border border-slate-100 mt-2 mb-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Valor da Oportunidade</span>
                  <p className="text-lg font-black text-slate-900 leading-none">R$ {Number(deal?.value || 0).toFixed(2).replace('.', ',')}</p>
                </div>
                
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Etapa Atual</span>
                  <div className="flex items-center gap-2">
                    <span className={\`h-2.5 w-2.5 rounded-full \${currentColumn.color.replace('bg-', 'bg-').replace('-500', '-400')} shadow-sm\`}></span>
                    <span className="text-sm font-bold text-slate-800">{currentColumn.title}</span>
                  </div>
                </div>
                
                <div className="relative border-t border-slate-100 pt-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Responsável</span>
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center justify-between w-[90%] text-left text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer group"
                  >
                    {selectedUser} <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                  
                  {isUserDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)}></div>
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                        <button 
                          onClick={() => assignUser("Sem responsável")}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Sem responsável
                        </button>
                        {users.map((u, i) => {
                          const nameParts = u.name ? u.name.split(' ') : u.email.split('@')[0].split(' ');
                          const shortName = nameParts.length > 1 ? \`\${nameParts[0]} \${nameParts[1]}\` : nameParts[0];
                          return (
                            <button 
                              key={i}
                              onClick={() => assignUser(shortName)}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                            >
                              {shortName}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Criado em
                  </span>
                  <p className="text-sm font-bold text-slate-700">
                    {deal?.createdAt ? new Date(deal.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
              </div>

              <div className="border-b border-slate-200/80 my-2"></div>

              {/* Timeline Panel */}
              <div className="py-3 flex flex-col flex-1 min-h-[250px]">
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Linha do Tempo de Transações</span>
                </div>
                
                <div className="flex-1 space-y-4">
                  {timelineEvents.length === 0 ? (
                    <div className="h-20 flex items-center justify-center text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Nenhuma transação encontrada.
                    </div>
                  ) : (
                    timelineEvents.map((evt, idx) => {
                      const isPaid = evt.metadata?.status === 'paid' || evt.event === 'order.paid';
                      return (
                        <div key={evt.id || idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={\`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm \${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}\`}>
                              <span className="text-[10px] font-bold">{isPaid ? 'R$' : '⏳'}</span>
                            </div>
                            {idx < timelineEvents.length - 1 && <div className="w-0.5 h-full bg-slate-200 my-1"></div>}
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl p-3 flex-1 mb-2 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className={\`text-[10px] font-bold uppercase tracking-wider \${isPaid ? 'text-emerald-600' : 'text-orange-600'}\`}>
                                {isPaid ? 'Compra Aprovada' : 'Pedido Gerado'}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {new Date(evt.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 leading-snug">
                              {evt.metadata?.item_title || evt.metadata?.course_name || "Produto Realizzare"}
                            </p>
                            {evt.metadata?.amount && (
                              <p className="text-xs font-bold text-slate-500 mt-1.5">
                                R$ {Number(evt.metadata.amount).toFixed(2).replace('.', ',')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
`;

let startIdx = c.indexOf('{/* Main Info Grid */}');
let endIdx = c.indexOf('{/* Action Buttons */}');

if (startIdx !== -1 && endIdx !== -1) {
  let newC = c.substring(0, startIdx - 14) + newLayout + '\n            </>\n          }\n          \n        </div>\n\n        ' + c.substring(endIdx);
  fs.writeFileSync('src/components/crm/DealModal.tsx', newC);
  console.log("Success");
}
