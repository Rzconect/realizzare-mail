const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const targetApagar = `                            <button onClick={() => { setActiveMessageMenu(null); alert("Apagar mensagem ainda não implementado."); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Apagar mensagem</button>`;

const replacementApagar = `                            <button onClick={async () => { 
                              setActiveMessageMenu(null);
                              try {
                                await fetch(\`/api/whatsapp/message?messageId=\${msg.id}&remoteJid=\${activeChat.phone}@s.whatsapp.net\`, { method: 'DELETE' });
                                // Optimistically remove from UI
                                setChats(prev => prev.map(c => {
                                  if (c.id === activeChat.id) {
                                    return { ...c, messages: c.messages.filter(m => m.id !== msg.id) };
                                  }
                                  return c;
                                }));
                              } catch (e) {
                                alert("Erro ao apagar mensagem.");
                              }
                            }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Apagar mensagem</button>`;

c = c.replace(targetApagar, replacementApagar);
c = c.replace(targetApagar, replacementApagar); // There are two (Bot and Normal)

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed Apagar UI');
