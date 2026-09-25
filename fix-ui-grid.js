const fs = require('fs');
let c = fs.readFileSync('src/components/TriggerConfigModal.tsx', 'utf8');

const regex = /<div className="grid grid-cols-2 gap-4">[\s\S]*?<label className="block text-\[10px\] font-bold text-slate-500 uppercase tracking-wider">Valor Condicional<\/label>/m;

const replacement = `<div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Regra Adicional (Opcional)</label>
                  <select value={selectedRule} onChange={(e) => setSelectedRule(e.target.value)} className="w-full mt-1.5 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium focus:border-indigo-500 outline-none">
                    <option>Nenhuma regra extra</option>
                    <option>Nome do Curso específico</option>
                    {isPagarmeEvent && <option>SKU do Produto específico</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operador</label>
                  <select value={selectedOperator} onChange={(e) => setSelectedOperator(e.target.value)} disabled={selectedRule === "Nenhuma regra extra"} className="w-full mt-1.5 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium focus:border-indigo-500 outline-none disabled:opacity-50 disabled:bg-slate-50">
                    <option>É igual a</option>
                    <option>Diferente de</option>
                    <option>Contém</option>
                    <option>Não contém</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Condicional</label>`;

c = c.replace(regex, replacement);

fs.writeFileSync('src/components/TriggerConfigModal.tsx', c);
console.log('Fixed TriggerConfigModal UI');
