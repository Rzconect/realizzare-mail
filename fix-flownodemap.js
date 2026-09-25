const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const regex = /const campaignMap = new Map<string, string>\(\);\n\s*if \(dbCampaigns\) \{\n\s*dbCampaigns\.forEach\(\(c: any\) => campaignMap\.set\(c\.id, c\.name\)\);\n\s*\}/;

const newBlock = `const campaignMap = new Map<string, string>();
      if (dbCampaigns) {
        dbCampaigns.forEach((c: any) => campaignMap.set(c.id, c.name));
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

c = c.replace(regex, newBlock);
fs.writeFileSync('src/app/dashboard/page.tsx', c);
console.log('Fixed flowNodeMap injection');
