const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const regex = /<div className="space-y-2\.5 text-sm">[\s\S]*?<!-- Cursos -->/g;

const replacement = `<div className="space-y-2.5 text-sm">
                             <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-xs">Nome:</span>
                                <span className="font-medium text-slate-700 text-right text-xs truncate max-w-[180px]" title={\`\${profile.first_name} \${profile.last_name}\`}>{profile.first_name} {profile.last_name}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-xs">Telefone:</span>
                                <span className="font-medium text-slate-700 text-right text-xs">{profile.phone || "Não informado"}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-xs">E-mail:</span>
                                <span className="font-medium text-slate-700 text-right text-xs break-all" title={profile.email}>{profile.email || "Não informado"}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-xs">Cidade:</span>
                                <span className="font-medium text-slate-700 text-right text-xs">{profile.location?.city || "Não informada"}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-xs">Estado:</span>
                                <span className="font-medium text-slate-700 text-right text-xs">{profile.location?.state || "-"}</span>
                             </div>
                          </div>
                        </div>

                        {/* Cursos */}`;

c = c.replace(/<div className="space-y-2\.5 text-sm">[\s\S]*?\{\/\* Cursos \*\/\}/g, replacement);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed info fields');
