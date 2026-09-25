const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/automations/page.tsx', 'utf8');

c = c.replace(
  'const [flows, setFlows] = useState<Flow[]>([]);',
  'const [flows, setFlows] = useState<Flow[]>([]);\n  const [isLoading, setIsLoading] = useState(true);'
);

const fetchFlowsRegex = /const fetchFlows = async \(\) => \{[\s\S]*?console\.error\("Erro ao buscar automacoes:", err\);\n        \}\n      \};/;
const replaceFetch = `const fetchFlows = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("flows")
            .select("*")
            .eq("is_deleted", false)
            .order("created_at", { ascending: false });
  
          if (error) throw error;
  
          if (data) {
              let activeContactsMap: Record<string, number> = {};
              let finishedContactsMap: Record<string, number> = {};
              try {
                const res = await fetch("/api/flows/summary");
                const summaryData = await res.json();
                if (summaryData.activeContacts) activeContactsMap = summaryData.activeContacts;
                  if (summaryData.finishedContacts) finishedContactsMap = summaryData.finishedContacts;
              } catch (e) {}
              
              const mapped = data.map((f: any) => ({
              id: f.id,
              name: f.name,
              triggerDescription: f.description || f.trigger_type || "Gatilho Padrão",
              type: "Automação",
              status: f.status === "active" ? "Ativo" : f.status === "paused" ? "Pausado" : "Rascunho",
              updatedAt: new Date(f.updated_at || f.created_at).toLocaleString("pt-BR"),
              activeContacts: activeContactsMap[f.id] || 0,
              finishedContacts: finishedContactsMap[f.id] || 0
              }));
              setFlows(mapped);
          }
        } catch (err) {
          console.error("Erro ao buscar automacoes:", err);
        } finally {
          setIsLoading(false);
        }
      };`;

c = c.replace(fetchFlowsRegex, replaceFetch);

c = c.replace(
  '{filteredFlows.length > 0 ? (',
  `{isLoading ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Carregando automações...</p>
                  </div>
                </td></tr>
              ) : filteredFlows.length > 0 ? (`
);

fs.writeFileSync('src/app/dashboard/automations/page.tsx', c);
console.log('Fixed isLoading properly');
