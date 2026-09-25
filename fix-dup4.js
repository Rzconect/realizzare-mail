const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/automations/page.tsx', 'utf8');
c = c.replace(/const triggerDesc = cloneFlowTrigger === "Iniciou Curso"[\s\S]*?: cloneFlowTrigger;/g, 'const triggerDesc = cloneFlowTrigger;');
fs.writeFileSync('src/app/dashboard/automations/page.tsx', c);
console.log('Fixed triggerDesc');
