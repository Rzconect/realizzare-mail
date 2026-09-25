const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/automations/page.tsx', 'utf8');

const startStr = '{cloneFlowTrigger === "Iniciou Curso" && (';
const endStr = '              <div className="space-y-1.5">\n                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Tipo de Envio</label>';

const startIdx = c.indexOf(startStr);
const endIdx = c.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const toReplace = c.substring(startIdx, endIdx);
    c = c.split(toReplace).join('');
    fs.writeFileSync('src/app/dashboard/automations/page.tsx', c);
    console.log('Removed course selector block');
} else {
    console.log("Could not find start or end index");
}
