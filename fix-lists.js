const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(
  /label: statusText,\n\s*details: ls\.lists\.name,\n\s*timestamp: ls\.updated_at \|\| contact\.created_at\n\s*\}\);/g,
  `label: statusText,
                details: ls.lists?.name || "Lista Desconhecida",
                timestamp: ls.updated_at || contact.created_at,
                payload: {
                  "Motivo": ls.status === 'subscribed' 
                    ? "Inscrição manual, atualização de perfil ou fluxo de automação" 
                    : "Cancelamento de inscrição, atualização de perfil ou fluxo de automação"
                }
              });`
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed lists payload');
