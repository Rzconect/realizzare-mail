const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const regex = /(rawEvents\.push\(\{\n\s*id: \`created-\$\{contact\.id\}\`,\n\s*type: "import",\n\s*label: "Contato Cadastrado",\n\s*details: \`Registrado através de: \$\{sourceDetail\}\`,\n\s*payload: \{[\s\S]*?\}\n\s*\}\);)/;

const newCode = `
        if (contact.list_subscriptions && contact.list_subscriptions.length > 0) {
          contact.list_subscriptions.forEach((ls: any, idx: number) => {
            if (ls.lists?.name) {
              const statusText = ls.status === 'subscribed' ? 'Inscrito na Lista' : 'Removido da Lista';
              rawEvents.push({
                id: \`list-sub-\${contact.id}-\${idx}\`,
                type: ls.status === 'subscribed' ? 'check' : 'x',
                label: statusText,
                details: ls.lists.name,
                timestamp: ls.updated_at || contact.created_at
              });
            }
          });
        }
`;

const match = c.match(regex);
if (match) {
  c = c.replace(match[0], match[0] + newCode);
  fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
  console.log('Added list_subscriptions to rawEvents');
} else {
  console.log('Regex match failed');
}
