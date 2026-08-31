
const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/contacts/[id]/page.tsx", "utf8");

// I will just find where flowNodesData is fetched and move it UP!
// Wait, I can just replace the fetch so it is declared before its use.
const oldBlock = `        const flowNodeMap = new Map<string, any>();
        if (flowNodesData) {
          flowNodesData.forEach((n: any) => {
            if (n.config && n.config.campaignName) {
              flowNodeMap.set(n.id, { name: n.config.campaignName, flowName: n.flows?.name || "Fluxo de Automação" });
            }
          });
        }

        const { data: flowNodesData } = await supabase.from("flow_nodes").select("id, config, flows(name)");`;

const newBlock = `        const { data: flowNodesData } = await supabase.from("flow_nodes").select("id, config, flows(name)");
        const flowNodeMap = new Map<string, any>();
        if (flowNodesData) {
          flowNodesData.forEach((n: any) => {
            if (n.config && n.config.campaignName) {
              flowNodeMap.set(n.id, { name: n.config.campaignName, flowName: n.flows?.name || "Fluxo de Automação" });
            }
          });
        }`;

if (content.indexOf("if (flowNodesData) {") > -1) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync("src/app/dashboard/contacts/[id]/page.tsx", content, "utf8");
  console.log("Fixed flowNodesData order!");
} else {
  console.log("Could not find flowNodesData block.");
}

