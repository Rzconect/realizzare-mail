const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(
  /\.select\("id, name, target_list, status, sent_at, created_at"\);/,
  '.select("id, name, subject, target_list, status, sent_at, created_at");'
);

c = c.replace(
  /label: \`Foi enviado o \$\{c\.name\}\`,\n\s*details: \`Automação: \$\{flowName\}\`,\n\s*timestamp: c\.sent_at \|\| c\.created_at\n\s*\}\);/g,
  `label: \`Foi enviado o \${c.name}\`,
                  details: \`Automação: \${flowName}\`,
                  timestamp: c.sent_at || c.created_at,
                  payload: { "Assunto": c.subject || "(Sem assunto)", "Campaign ID": c.id }
                });`
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed campaigns payload');
