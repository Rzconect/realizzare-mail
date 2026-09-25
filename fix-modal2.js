const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const target = '{showNewChatModal && (';
const replacement = `{isPanelConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Configurar Painel</h3>
              <button onClick={() => setIsPanelConfigOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              {panelConfig.order.map((sec, i) => (
                <div key={sec} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{sec === 'personal' ? 'Info Pessoais' : sec === 'cursos' ? 'Cursos' : sec === 'transacoes' ? 'Transações' : sec === 'timeline' ? 'Linha do Tempo' : 'Observações'}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleSection(sec)} className={\`text-[10px] px-2 py-1 font-bold rounded \${panelConfig.openState[sec] ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}\`}>{panelConfig.openState[sec] ? 'ABERTO' : 'FECHADO'}</button>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => movePanelSection(i, -1)} disabled={i === 0} className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50"><ChevronUp className="h-3 w-3 text-slate-600"/></button>
                      <button onClick={() => movePanelSection(i, 1)} disabled={i === panelConfig.order.length - 1} className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50"><ChevronDown className="h-3 w-3 text-slate-600"/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNewChatModal && (`

c = c.replace(target, replacement);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Added Modal');
