const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const regex = /\.sort\(\(a, b\) => new Date\(b\.timestamp\)\.getTime\(\) - new Date\(a\.timestamp\)\.getTime\(\)\)/;

const newSort = `.sort((a, b) => {
            const tA = new Date(a.timestamp).getTime();
            const tB = new Date(b.timestamp).getTime();
            if (tA !== tB) return tB - tA;
            const weight = (label) => {
              if (label.includes("Finalizou")) return 6;
              if (label.includes("Aberto") || label.includes("Clicado")) return 5;
              if (label.includes("Foi enviado")) return 4;
              if (label.includes("Iniciou")) return 3;
              if (label.includes("Inscrito") || label.includes("Removido")) return 2;
              if (label.includes("Cadastrado")) return 1;
              return 0;
            };
            return weight(b.label || "") - weight(a.label || "");
          })`;

c = c.replace(regex, newSort);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed timeline sort');
