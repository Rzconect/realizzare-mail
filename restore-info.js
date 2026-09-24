const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const target = `<div className="space-y-6">
                        {/* Dados do Aluno */}
                        <div>
                          <button onClick={() => toggleSection('cursos')}`;

const replacement = `<div className="space-y-6">
                        {/* Dados do Aluno */}
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-200 pb-2">
                            <UserIcon className="h-4 w-4 text-slate-400" /> Informações Pessoais
                          </h5>
                          <div className="space-y-2.5 text-sm">
                             <div className="flex items-center gap-3 mb-4 mt-2">
                               <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                 {profile.first_name?.charAt(0) || ""}{profile.last_name?.charAt(0) || ""}
                               </div>
                               <h4 className="font-bold text-slate-800 text-sm truncate">{profile.first_name} {profile.last_name}</h4>
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

                        {/* Cursos */}
                        <div>
                          <button onClick={() => toggleSection('cursos')}`;

c = c.replace(target, replacement);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Restored Informações Pessoais');
