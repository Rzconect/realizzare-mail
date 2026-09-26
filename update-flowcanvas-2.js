const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

const htmlEditorOriginal = `                            <textarea
                              value={editNodeHtmlContent}
                              onChange={(e) => setEditNodeHtmlContent(e.target.value)}
                              placeholder="Cole seu código HTML ou altere-o por aqui..."
                              className="w-full h-40 p-2.5 border border-slate-250 focus:border-indigo-500 rounded-xl text-[10px] font-mono outline-none resize-none bg-slate-50/50"
                            />`;

const htmlEditorReplaced = `                            <div className="relative">
                              <textarea
                                value={editNodeHtmlContent}
                                onChange={(e) => setEditNodeHtmlContent(e.target.value)}
                                placeholder="Cole seu código HTML ou altere-o por aqui..."
                                className="w-full h-40 p-2.5 pr-10 border border-slate-250 focus:border-indigo-500 rounded-xl text-[10px] font-mono outline-none resize-none bg-slate-50/50"
                              />
                              <div className="absolute right-0 top-0 bottom-0 flex items-start pt-2 pr-2">
                                <button
                                  type="button"
                                  title="Variáveis Dinâmicas"
                                  onClick={() => setShowVarsPanel(!showVarsPanel)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg shadow-sm transition-colors cursor-pointer"
                                >
                                  <Braces className="h-4 w-4" />
                                </button>
                                {showVarsPanel && (
                                  <div className="absolute top-10 right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                      <span className="text-xs font-bold text-slate-700">Variáveis Disponíveis</span>
                                      <button type="button" onClick={() => setShowVarsPanel(false)} className="text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                      {getEventVarsForTrigger(flow?.triggerMetric || flow?.trigger_metric || "").map((v, idx) => (
                                        <div key={idx} className="flex flex-col p-1.5 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition-colors">
                                          <span className="text-[10px] font-bold text-slate-600 mb-0.5">{v.label}</span>
                                          <div className="flex items-center gap-1">
                                            <code className="flex-1 px-1.5 py-1 bg-slate-100 text-[9px] text-slate-700 rounded font-mono select-all truncate">{v.tag}</code>
                                            <button
                                              type="button"
                                              title="Copiar"
                                              onClick={() => {
                                                navigator.clipboard.writeText(v.tag);
                                                setCopiedVar(v.tag);
                                                setTimeout(() => setCopiedVar(null), 2000);
                                              }}
                                              className="p-1 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded cursor-pointer transition-colors"
                                            >
                                              {copiedVar === v.tag ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>`;

c = c.replace(htmlEditorOriginal, htmlEditorReplaced);
fs.writeFileSync('src/components/FlowCanvas.tsx', c);
console.log('done!');
