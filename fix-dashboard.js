const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

c = c.replace(
  'name: meta.customer_name || "Aluno Realizzare",',
  'name: (meta.customer_name || "Aluno Realizzare").split(/\\s+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "), // fixed capitalization'
);

const emptyStateRegex = /\{filteredEventsList\.length === 0 \? \([\s\S]*?\) : \(\s*filteredEventsList\.map/m;

const replacement = `{isLoadingMetrics ? (
                  <div className="flex flex-col space-y-3 py-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center p-3 border border-slate-100 rounded-xl gap-3">
                        <div className="h-10 w-10 bg-slate-200 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-200 rounded w-1/3" />
                          <div className="h-2 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredEventsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {eventsSearchTerm ? "Nenhum evento encontrado para a busca" : "Nenhum evento registrado ainda"}
                      </span>
                      <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 font-medium">
                        {eventsSearchTerm ? "Tente buscar por outro termo ou nome de aluno." : (eventsTypeFilter === 'email' ? "Não houveram disparos de e-mail ou interações no período." : "As interações e vendas aparecerão aqui em tempo real.")}
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredEventsList.map`;

c = c.replace(emptyStateRegex, replacement);

fs.writeFileSync('src/app/dashboard/page.tsx', c);
console.log('Fixed page');
