const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/campaigns/create/page.tsx', 'utf-8');

// 1. Add state variable
content = content.replace(
  'const [newSegmentName, setNewSegmentName] = useState("");',
  'const [newSegmentName, setNewSegmentName] = useState("");\n  const [isSegmentDynamic, setIsSegmentDynamic] = useState(true);'
);

// 2. Add UI for Dynamic vs Static
const uiTarget = `              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Segmentação</label>
                <input
                  type="text"
                  placeholder="Ex: Alunos de React ativos em SP"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-202 rounded-md py-2 px-3.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>`;

const uiReplacement = `              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Segmentação</label>
                <input
                  type="text"
                  placeholder="Ex: Alunos de React ativos em SP"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-202 rounded-md py-2 px-3.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Comportamento da Segmentação</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSegmentDynamic(true)}
                    className={\`text-left p-3 rounded-lg border \${isSegmentDynamic ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:bg-slate-50'}\`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={\`text-xs font-bold \${isSegmentDynamic ? 'text-indigo-800' : 'text-slate-700'}\`}>Dinâmica (Recomendado)</span>
                      {isSegmentDynamic && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">Os leads entram e saem da lista automaticamente sempre que atingem ou perdem as regras configuradas.</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsSegmentDynamic(false)}
                    className={\`text-left p-3 rounded-lg border \${!isSegmentDynamic ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:bg-slate-50'}\`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={\`text-xs font-bold \${!isSegmentDynamic ? 'text-indigo-800' : 'text-slate-700'}\`}>Travada / Estática</span>
                      {!isSegmentDynamic && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">Captura os leads exatos que baterem as regras agora. Não adiciona novos leads no futuro.</p>
                  </button>
                </div>
              </div>`;

content = content.replace(uiTarget, uiReplacement);

// 3. Update DB logic to save dynamic rules inside description if dynamic!
const dbInsertTarget = `      const { data: newList, error: listErr } = await supabase.from("lists").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        name: newSegmentName,
        description: "Segmentação dinâmica (salva estaticamente)",
        type: "segment"
      }).select("id").single();`;

const dbInsertReplacement = `      // Save rules in description if dynamic
      const rulesPayload = {
        isDynamic: isSegmentDynamic,
        globalOperator,
        segmentGroups
      };
      
      const { data: newList, error: listErr } = await supabase.from("lists").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        name: newSegmentName,
        description: isSegmentDynamic ? JSON.stringify(rulesPayload) : "Segmentação travada (estática)",
        type: isSegmentDynamic ? "segmentation" : "segment"
      }).select("id").single();`;

content = content.replace(dbInsertTarget, dbInsertReplacement);

fs.writeFileSync('src/app/dashboard/campaigns/create/page.tsx', content, 'utf-8');
console.log('Done dynamic option.');
