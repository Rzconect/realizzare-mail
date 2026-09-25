const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(
  /label: "Entrou na Automação",\s*details: `O lead entrou no fluxo de automação '\$\{flowName\}'`,/,
  `label: "Iniciou Automação",
              details: \`\${flowName}\`,`
);

c = c.replace(
  /label: "Finalizou a Automação",\s*details: `O lead completou todas as etapas do fluxo '\$\{flowName\}'`,/,
  `label: "Finalizou 100% Automação",
                  details: \`\${flowName}\`,`
);

c = c.replace(
  /label: "E-mail Enviado \(Automação\)",\s*details: `Fluxo: \$\{flowName\} • Campanha: '\$\{campTitle\}'`,/,
  `label: \`Foi enviado o \${campTitle}\`,
                details: \`Automação: \${flowName}\`,`
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed labels');
