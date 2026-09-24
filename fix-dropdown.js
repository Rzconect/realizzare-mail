const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const target = `<div className="flex items-center justify-end gap-1 mt-1">
                        <span className={\`text-[9px] font-semibold \${isMine ? "text-emerald-700/60" : "text-slate-400"}\`}>{msg.time}</span>
                        {isMine && <CheckCheck className="h-3 w-3 text-blue-500" />}
                      </div>`;

const replacement = `<div className="flex items-center justify-end gap-1 mt-1">
                        <span className={\`text-[9px] font-semibold \${isMine ? "text-emerald-700/60" : "text-slate-400"}\`}>{msg.time}</span>
                        {isMine && <CheckCheck className="h-3 w-3 text-blue-500" />}
                      </div>
                      <button onClick={() => setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id)} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-0.5 rounded-full shadow-sm text-slate-500 hover:text-slate-800">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      {activeMessageMenu === msg.id && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setActiveMessageMenu(null)}></div>
                          <div className="absolute right-2 top-8 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                            <button onClick={() => { setActiveMessageMenu(null); alert("Responder ainda não implementado."); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Responder</button>
                            <button onClick={() => { setActiveMessageMenu(null); alert("Apagar mensagem ainda não implementado."); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Apagar mensagem</button>
                            <button onClick={() => { setActiveMessageMenu(null); alert("Encaminhar ainda não implementado."); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Encaminhar</button>
                            <button onClick={() => { setActiveMessageMenu(null); alert("Editar ainda não implementado."); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Editar</button>
                          </div>
                        </>
                      )}`;

c = c.replace(target, replacement);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed normal message dropdown');
