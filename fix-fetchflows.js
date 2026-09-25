const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/automations/page.tsx', 'utf8');

const oldFetchStart = 'const fetchFlows = async () => {';
const fetchEnd = 'fetchFlows();';

const startIdx = c.indexOf(oldFetchStart);
const endIdx = c.indexOf(fetchEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const replaceWith = `const fetchFlows = async () => {
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
              status: (f.status === "active" ? "Ativo" : (f.status === "paused" ? "Pausado" : "Rascunho")) as "Ativo" | "Pausado" | "Rascunho",
              updatedAt: new Date(f.updated_at || f.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
              activeContacts: activeContactsMap[f.id] || 0,
              finishedContacts: finishedContactsMap[f.id] || f.finished_contacts || 0,
              certificatesIssued: f.certificates_issued || 0,
              revenueGenerated: f.revenue_generated || 0
              }));
              setFlows(mapped);
          }
        } catch (err) {
          console.error("Erro ao buscar automacoes:", err);
        } finally {
          setIsLoading(false);
        }
      };
      `;
    c = c.substring(0, startIdx) + replaceWith + c.substring(endIdx);
} else {
    console.log("Could not find boundaries");
}

fs.writeFileSync('src/app/dashboard/automations/page.tsx', c);
console.log('Fixed fetchFlows setIsLoading');
