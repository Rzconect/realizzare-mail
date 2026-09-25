const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/automations/page.tsx', 'utf8');

c = c.replace(
  'const [flows, setFlows] = useState<Flow[]>([]);',
  'const [flows, setFlows] = useState<Flow[]>([]);\n  const [isLoading, setIsLoading] = useState(true);'
);

const fetchFlowsRegex = /const fetchFlows = async \(\) => \{[\s\S]*?setFlows\(mapped\);\n[\s\S]*?console\.error\(err\);\n    \}/;

c = c.replace(fetchFlowsRegex, `const fetchFlows = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("flows").select("*").eq("is_deleted", false).order("created_at", { ascending: false });
      
      if (data) {
        const mapped = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          triggerDescription: f.trigger_type || "Event",
          type: "Automação",
          status: f.status === "active" ? "Ativo" : f.status === "paused" ? "Pausado" : "Rascunho",
          updatedAt: new Date(f.updated_at || f.created_at).toLocaleString("pt-BR"),
          activeContacts: 0
        }));
        setFlows(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }`);

c = c.replace(
  '{filteredFlows.length === 0 ? (',
  '{isLoading ? (\n          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200 mt-6">\n            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>\n            <p className="text-slate-500">Carregando automações...</p>\n          </div>\n        ) : filteredFlows.length === 0 ? ('
);

c = c.replace(
  'Criar Automação\n              </button>\n            </div>\n          </div>\n        ) : (',
  'Criar Automação\n              </button>\n            </div>\n          </div>\n        ) : ('
);

fs.writeFileSync('src/app/dashboard/automations/page.tsx', c);
console.log('Fixed isLoading successfully');
