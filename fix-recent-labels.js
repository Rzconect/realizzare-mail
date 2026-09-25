const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const fetchCampaignsRegex = /const campaignMap = new Map<string, string>\(\);\n\s*if \(dbCampaigns\) \{\n\s*dbCampaigns\.forEach\(\(c: any\) => campaignMap\.set\(c\.id, c\.name\)\);\n\s*\}/;

const newFetch = `const campaignMap = new Map<string, string>();
      if (dbCampaigns) {
        dbCampaigns.forEach((c: any) => campaignMap.set(c.id, c.name));
      }

      const { data: flowNodesData } = await supabase.from("flow_nodes").select("id, config, flow_id, flows(name)");
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

c = c.replace(fetchCampaignsRegex, newFetch);

const campTitleRegex = /const campTitle = campaignObj\?\.name \|\| "Campanha Realizzare";/g;

c = c.replace(campTitleRegex, `const campTitle = campaignObj?.name || (payload.campaign_id && flowNodeMap.get(payload.campaign_id)?.name) || (payload.node_id && flowNodeMap.get(payload.node_id)?.name) || "Campanha Automática";`);

fs.writeFileSync('src/app/dashboard/page.tsx', c);
console.log('Fixed recent events labels');
