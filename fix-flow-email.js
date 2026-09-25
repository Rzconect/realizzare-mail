const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(
  /flowNodeMap\.set\(n\.id, \{ name: n\.config\.campaignName, flowName: n\.flows\?\.name \|\| "Automação" \}\);/g,
  `flowNodeMap.set(n.id, { 
                name: n.config.campaignName, 
                flowName: n.flows?.name || "Automação",
                campaignId: n.config.emailCampaignId || "N/A",
                subject: n.config.subject || "(Sem assunto)"
              });`
);

c = c.replace(
  /let campTitle = "E-mail";\s*let flowName = "Automação";\s*if \(log\.node_id && flowNodeMap\.has\(log\.node_id\)\) \{\s*const nd = flowNodeMap\.get\(log\.node_id\);\s*campTitle = nd\.name;\s*flowName = nd\.flowName;\s*\}/,
  `let campTitle = "E-mail";
              let flowName = "Automação";
              let campId = "N/A";
              let campSubj = "(Sem assunto)";
              if (log.node_id && flowNodeMap.has(log.node_id)) {
                 const nd = flowNodeMap.get(log.node_id);
                 campTitle = nd.name;
                 flowName = nd.flowName;
                 campId = nd.campaignId;
                 campSubj = nd.subject;
              }`
);

c = c.replace(
  /label: \`Foi enviado o \$\{campTitle\}\`,\n\s*details: \`Automação: \$\{flowName\}\`,\n\s*timestamp: log\.created_at\n\s*\}\);/g,
  `label: \`Foi enviado o \${campTitle}\`,
                details: \`Automação: \${flowName}\`,
                timestamp: log.created_at,
                payload: { "Assunto": campSubj, "Campaign ID": campId }
              });`
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed flow email payload');
