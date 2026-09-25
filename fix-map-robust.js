const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const regex = /dbCampaigns\.forEach\(\(c: any\) => campaignMap\.set\(c\.id, c\.name\)\);\n?\r?\s*\}/;

const block = `dbCampaigns.forEach((c: any) => campaignMap.set(c.id, c.name));
      }

      const { data: flowNodesData } = await supabase.from("flow_nodes").select("id, config");
      const flowNodeMap = new Map<string, any>();
      if (flowNodesData) {
        flowNodesData.forEach((n: any) => {
          if (n.config && n.config.campaignName) {
            flowNodeMap.set(n.id, { name: n.config.campaignName });
            if (n.config.emailCampaignId) {
              flowNodeMap.set(n.config.emailCampaignId, { name: n.config.campaignName });
            }
          }
        });
      }`;

c = c.replace(regex, block);
fs.writeFileSync('src/app/dashboard/page.tsx', c);
console.log('Fixed flowNodeMap via robust regex');
