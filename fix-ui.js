const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(
  /<div key=\{i\} className=\"flex flex-col text-xs leading-tight space-y-0\.5\">\s*<span className=\"text-\[10px\] font-bold text-slate-400 uppercase tracking-wider\">\{item\.key\}:<\/span>\s*<span className=\"font-semibold text-slate-800 break-all select-all\">\{item\.value\}<\/span>\s*<\/div>/g,
  `<div key={i} className="flex flex-col text-xs leading-tight space-y-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.key}:</span>
                                    {item.key === "Campaign ID" && item.value !== "N/A" ? (
                                      <a href={\`/api/emails/preview?id=\${item.value}\`} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 w-fit hover:underline">
                                        <Eye className="h-3.5 w-3.5" /> Visualizar E-mail
                                      </a>
                                    ) : (
                                      <span className="font-semibold text-slate-800 break-all select-all">{item.value}</span>
                                    )}
                                  </div>`
);

// We also need to add a payload to the Finalizou 100% Automação event!
c = c.replace(
  /label: \"Finalizou 100% Automação\",\n\s*details: \`\$\{flowName\}\`,\n\s*timestamp: r\.updated_at\n\s*\}\);/g,
  `label: "Finalizou 100% Automação",
                  details: \`\${flowName}\`,
                  timestamp: r.updated_at,
                  payload: { "Status": \`Usuário concluiu todas as etapas do fluxo (\${flowName})\` }
               });`
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed UI payload mapping and end event');
