const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const regex = /<div className="flex items-center gap-3 mb-4 mt-2">[\s\S]*?<\/div>\s*<\/div>/;

const replacement = `<div className="flex justify-between items-center">
                                <span className="text-slate-500 text-xs">Nome:</span>
                                <span className="font-medium text-slate-700 text-right text-xs truncate max-w-[180px]" title={\`\${profile.first_name} \${profile.last_name}\`}>{profile.first_name} {profile.last_name}</span>
                             </div>`;

c = c.replace(regex, replacement);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed name format');
