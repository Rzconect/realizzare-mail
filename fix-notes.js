const fs = require('fs');

const path = 'src/components/crm/ContactNotes.tsx';
let c = fs.readFileSync(path, 'utf8');

const target = `<div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-700 block">{note.author_name || "Observação"}</span>
                      <span className="text-[9px] text-slate-400">{new Date(note.created_at).toLocaleDateString('pt-BR')} às {new Date(note.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>`;

const replacement = `<div className="mb-1">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(note.created_at).toLocaleDateString('pt-BR')} às {new Date(note.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>`;

c = c.replace(target, replacement);

fs.writeFileSync(path, c);
console.log('Fixed ContactNotes UI');
