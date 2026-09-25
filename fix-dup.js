const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/automations/page.tsx', 'utf8');

const regex = /\{cloneFlowTrigger === "Iniciou Curso" && \([\s\S]*?\}\)}\s*(?=<div className="space-y-1.5">\s*<label className="text-\[10px\] font-bold text-slate-550 uppercase tracking-wider block">Tipo de Envio<\/label>)/;

const match = c.match(regex);
if (match) {
    console.log("Found match:");
    console.log(match[0]);
    c = c.replace(regex, '');
    fs.writeFileSync('src/app/dashboard/automations/page.tsx', c);
    console.log('Removed course selector block');
} else {
    console.log("No match found");
}
