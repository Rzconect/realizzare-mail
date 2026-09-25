const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const mappingRegex = /contactFlows = flowRunsData\.map\(\(r: any\) => \{\n\s*const totalNodes = flowTotalNodes\.get\(r\.flow_id\) \|\| 5; \/\/ guess 5 if unknown\n\s*const progress = r\.status === 'completed' \? 100 : Math\.min\(95, Math\.max\(10, Math\.round\(\(1 \/ totalNodes\) \* 100\)\)\); \/\/ simplistic progress\n\s*return \{\n\s*name: r\.flows\?\.name \|\| "Fluxo Desconhecido",\n\s*status: r\.status === 'completed' \? 'completed' : 'active',\n\s*progress,\n\s*entered_at: new Date\(r\.created_at\)\.toISOString\(\)\.split\('T'\)\[0\]\n\s*\};\n\s*\}\);/;

const newMapping = `contactFlows = flowRunsData.map((r: any) => {
              // Count only send_email nodes for this flow
              let emailNodesCount = 0;
              if (flowNodesData) {
                emailNodesCount = flowNodesData.filter((n: any) => n.flow_id === r.flow_id && n.config?.emailCampaignId).length;
              }
              const totalNodes = emailNodesCount || 1; // avoid division by zero
              const progress = r.status === 'completed' ? 100 : Math.min(95, Math.max(10, Math.round((1 / totalNodes) * 100)));
              
              // Timezone fix for entered_at
              const dateObj = new Date(r.created_at);
              // Shift by timezone offset so formatting it as local returns the correct calendar day
              const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
              const localDate = new Date(dateObj.getTime() - userTimezoneOffset);
              
              return {
                name: r.flows?.name || "Fluxo Desconhecido",
                status: r.status === 'completed' ? 'completed' : 'active',
                progress,
                total_emails: totalNodes,
                entered_at: localDate.toISOString().split('T')[0]
              };
            });`;

c = c.replace(mappingRegex, newMapping);

const uiRegex = /const totalSteps = flow\.name\.includes\("Boas-vindas"\) \? 5 : 4;\n\s*const currentStep = Math\.round\(\(flow\.progress \/ 100\) \* totalSteps\);/;
const newUi = `const totalSteps = flow.total_emails || 1;
                      const currentStep = flow.status === 'completed' ? totalSteps : Math.round((flow.progress / 100) * totalSteps);`;

c = c.replace(uiRegex, newUi);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed flows panel steps and date');
