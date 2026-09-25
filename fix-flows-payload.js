const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(
  /\.select\("\*, flows\(name\)"\)/,
  '.select("*, flows(name, trigger_type, trigger_metric)")'
);

c = c.replace(
  /label: "Iniciou Automação",\n\s*details: \`\$\{flowName\}\`,\n\s*timestamp: r\.created_at\n\s*\}\);/g,
  `label: "Iniciou Automação",
              details: \`\${flowName}\`,
              timestamp: r.created_at,
              payload: { "Gatilho": r.flows?.trigger_metric || r.flows?.trigger_type || "N/A" }
            });`
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed flows payload');
