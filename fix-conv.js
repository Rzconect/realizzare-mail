const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const h3Target = `<h3 className="font-bold text-slate-800 text-sm">Detalhes do Contato</h3>`;
const h3Replace = `<div className="flex items-center gap-2"><h3 className="font-bold text-slate-800 text-sm">Detalhes do Contato</h3>
                <Link href={\`/dashboard/contacts/\${linkedContacts[activeChat.id]}\`} title="Ver perfil completo">
                  <ExternalLink className="h-4 w-4 text-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors" />
                </Link>
                <button title="Desvincular contato" onClick={() => {
                  setLinkedContacts(prev => {
                    const next = { ...prev };
                    delete next[activeChat.id];
                    localStorage.setItem("realizzare_chat_contacts", JSON.stringify(next));
                    return next;
                  });
                }}>
                  <Unlink className="h-4 w-4 text-red-400 hover:text-red-600 cursor-pointer transition-colors" />
                </button></div>`;
c = c.replace(h3Target, h3Replace);

const emailUnderName = `<p className="text-[10px] text-slate-500 truncate">{profile.email}</p>`;
c = c.replace(emailUnderName, ``);

const personalEmailField = `<span className="font-medium text-slate-700 text-right text-xs truncate max-w-[150px]" title={profile.email}>{profile.email || "Nǜo informado"}</span>`;
c = c.replace(personalEmailField, `<span className="font-medium text-slate-700 text-right text-xs break-all" title={profile.email}>{profile.email || "Não informado"}</span>`);
const personalEmailFieldFallback = `<span className="font-medium text-slate-700 text-right text-xs truncate max-w-[150px]" title={profile.email}>{profile.email || "Não informado"}</span>`;
c = c.replace(personalEmailFieldFallback, `<span className="font-medium text-slate-700 text-right text-xs break-all" title={profile.email}>{profile.email || "Não informado"}</span>`);

const purchasesMap = `{profile.purchases.slice(0, 3).map((p: any, i: number) => (`
c = c.replace(purchasesMap, `{[...(profile.purchases || [])].sort((a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime()).slice(0, 3).map((p: any, i: number) => (`);

const bottomButtonsStart = c.indexOf('<Link href={`/dashboard/contacts/${linkedContacts[activeChat.id]}`} className="block text-center');
if (bottomButtonsStart !== -1) {
  const bottomButtonsEnd = c.indexOf('</button>', bottomButtonsStart) + 9;
  c = c.slice(0, bottomButtonsStart) + c.slice(bottomButtonsEnd);
}

// Ensure Unlink is imported
if (!c.includes('Unlink')) {
  c = c.replace("import { Search,", "import { Search, Unlink,");
}

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Conversations page fixed');
