const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const replacement = `
          let contactFlows: any[] = [];
          if (flowRunsData) {
            const flowTotalNodes = new Map<string, number>();
            if (flowNodesData) {
              flowNodesData.forEach((n: any) => {
                flowTotalNodes.set(n.flow_id, (flowTotalNodes.get(n.flow_id) || 0) + 1);
              });
            }
            contactFlows = flowRunsData.map((r: any) => {
              const totalNodes = flowTotalNodes.get(r.flow_id) || 5; // guess 5 if unknown
              const progress = r.status === 'completed' ? 100 : Math.min(95, Math.max(10, Math.round((1 / totalNodes) * 100))); // simplistic progress
              return {
                name: r.flows?.name || "Fluxo Desconhecido",
                status: r.status === 'completed' ? 'completed' : 'active',
                progress,
                entered_at: new Date(r.created_at).toISOString().split('T')[0]
              };
            });
          }

          const profileObj = {`;

c = c.replace(/const profileObj = \{/, replacement);
c = c.replace(/flows: \[\]/, 'flows: contactFlows');

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed flows display');
