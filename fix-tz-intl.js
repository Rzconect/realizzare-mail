const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const target = `const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
              const localDate = new Date(dateObj.getTime() - userTimezoneOffset);
              
              return {
                name: r.flows?.name || "Fluxo Desconhecido",
                status: r.status === 'completed' ? 'completed' : 'active',
                progress,
                total_emails: totalNodes,
                entered_at: localDate.toISOString().split('T')[0]
              };`;

const block = `const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
              const brtDate = dateObj.toLocaleDateString('pt-BR', options).split('/').reverse().join('-');

              return {
                name: r.flows?.name || "Fluxo Desconhecido",
                status: r.status === 'completed' ? 'completed' : 'active',
                progress,
                total_emails: totalNodes,
                entered_at: brtDate
              };`;

const replaced = c.split(target).join(block);
fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', replaced);
console.log('Fixed timezone properly via Intl API');
