const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/\(profile as any\)\.city \|\| "-"/g, '(profile as any).location?.city || "-"');
c = c.replace(/\(profile as any\)\.state \|\| "-"/g, '(profile as any).location?.state || "-"');

const oldTransac = /<span className=\{\`text-xs font-bold \$\{t\.status === 'Pago' \? 'text-emerald-600' : 'text-orange-500'\}\`\}>\{Number\(t\.amount \|\| 0\)\.toLocaleString\('pt-BR', \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\)\}<\/span>/g;

const newTransac = `
<div className="text-right">
  <p className={\`text-xs font-bold \$\{t.status === 'Pago' || t.status === 'paid' ? 'text-emerald-600' : 'text-orange-500'\}\`}>
    R$ {Number(t.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </p>
  <span className={\`inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded text-[8px] font-bold \$\{
    t.status === 'Pago' || t.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
    t.status === 'Pendente' || t.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
    'bg-red-100 text-red-700'
  \}\`}>
    {t.status === 'paid' ? 'PAGO' : t.status === 'pending' ? 'PENDENTE' : (t.status || '').toUpperCase()}
  </span>
</div>
`;

c = c.replace(oldTransac, newTransac);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed location and transactions');
