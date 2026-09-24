const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

// 1. Move Observações up
const observacoesBlock = `                        {/* Observações */}
                        <div>
                          <button onClick={() => toggleSection('notes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><FileText className="h-4 w-4 text-slate-400" /> Observações</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.notes ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.notes && (
                            <div className="mt-3">
                              <ContactNotes contactId={(profile as any).id || linkedContacts[activeChat.id]} />
                            </div>
                          )}
                        </div>`;

if (!c.includes(observacoesBlock)) { console.log('COULD NOT FIND OBS BLOCK'); }

c = c.replace(observacoesBlock, '');

const infPessoais = `                             </div>
                          </div>
                        </div>`;

const formattedNotesBlock = `                        {/* Observações */}
                        <div>
                          <button onClick={() => toggleSection('notes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><FileText className="h-4 w-4 text-slate-400" /> Observações</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.notes ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.notes && (
                            <div className="mt-3 h-[300px] overflow-hidden flex flex-col">
                              <ContactNotes contactId={(profile as any).id || linkedContacts[activeChat.id]} currentUser={currentUser ? { name: currentUser.name, initials: currentUser.name.split(" ").length > 1 ? (currentUser.name.split(" ")[0][0] + currentUser.name.split(" ")[currentUser.name.split(" ").length-1][0]).toUpperCase() : currentUser.name.substring(0,2).toUpperCase() } : undefined} />
                            </div>
                          )}
                        </div>`;

c = c.replace(infPessoais, infPessoais + '\n\n' + formattedNotesBlock);

// 2. Fix the Context Menu cutoff
c = c.replace('<div ref={messagesEndRef} />', '<div ref={messagesEndRef} className="pb-40" />');
c = c.replace('w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20', 'w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50');
c = c.replace('w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30', 'w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50');

// 3. Fix "Apagar para todos" and "Apagar para mim"
const apagarHtmlMyMessage = `<button onClick={() => { setActiveMessageMenu(null); alert("Apagar mensagem ainda não implementado na API local."); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Apagar mensagem</button>`;

const newApagarHtmlMyMessage = `<button onClick={async () => {
                                try {
                                  await fetch(\`/api/whatsapp/message?messageId=\${msg.id}&remoteJid=\${chat.remoteJid.replace("@s.whatsapp.net", "")}\`, { method: 'DELETE' });
                                  setActiveMessageMenu(null);
                                  setChats(prev => prev.map(c => {
                                    if (c.id === activeChat.id) {
                                      return { ...c, messages: c.messages.filter((m: any) => m.id !== msg.id) };
                                    }
                                    return c;
                                  }));
                                } catch (e) {
                                  alert("Erro ao apagar mensagem.");
                                }
                              }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Apagar para todos</button>`;

c = c.replace(apagarHtmlMyMessage, newApagarHtmlMyMessage);

const apagarHtmlTheirMessage = `<button onClick={() => { setActiveMessageMenu(null); alert("Apagar mensagem ainda não implementado na API local."); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Apagar mensagem</button>`;

const newApagarHtmlTheirMessage = `<button onClick={async () => {
                                try {
                                  await fetch(\`/api/whatsapp/message?messageId=\${msg.id}&remoteJid=\${chat.remoteJid.replace("@s.whatsapp.net", "")}&localOnly=true\`, { method: 'DELETE' });
                                  setActiveMessageMenu(null);
                                  setChats(prev => prev.map(c => {
                                    if (c.id === activeChat.id) {
                                      return { ...c, messages: c.messages.filter((m: any) => m.id !== msg.id) };
                                    }
                                    return c;
                                  }));
                                } catch(e) { alert("Erro ao apagar"); }
                              }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Apagar para mim</button>`;

c = c.replace(apagarHtmlTheirMessage, newApagarHtmlTheirMessage);

// Fix options payload in send API frontend
const targetFetch = `      // Call real API
      try {
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: chat.id,
            remoteJid: chat.remoteJid,
            text: textToSend
          })
        });`;

const replacementFetch = `      // Call real API
      try {
        const quoted = replyingTo;
        setReplyingTo(null);

        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: chat.id,
            remoteJid: chat.remoteJid,
            text: textToSend,
            options: quoted ? { quoted: { messageId: quoted.id } } : undefined
          })
        });`;

c = c.replace(targetFetch, replacementFetch);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed everything safely on fresh page.tsx');
