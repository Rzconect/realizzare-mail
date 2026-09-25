const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const search = 'const campaignMap = new Map<string, string>();\n      if (dbCampaigns) {\n        dbCampaigns.forEach((c: any) => campaignMap.set(c.id, c.name));\n      }';

const replace = search + `\n\n      const { data: flowNodesData } = await supabase.from("flow_nodes").select("id, config");\n      const flowNodeMap = new Map<string, any>();\n      if (flowNodesData) {\n        flowNodesData.forEach((n: any) => {\n          if (n.config && n.config.campaignName) {\n            flowNodeMap.set(n.id, { name: n.config.campaignName });\n            if (n.config.emailCampaignId) {\n              flowNodeMap.set(n.config.emailCampaignId, { name: n.config.campaignName });\n            }\n          }\n        });\n      }`;

c = c.replace(search, replace);
fs.writeFileSync('src/app/dashboard/page.tsx', c);
console.log('Fixed flowNodeMap injection simply');
