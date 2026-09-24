const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

// 1. Apagar para mim logic
const targetApagarMim = `                              <button onClick={() => {
                                setActiveMessageMenu(null);
                                setChats(prev => prev.map(c => {
                                  if (c.id === activeChat.id) {
                                    return { ...c, messages: c.messages.filter((m: any) => m.id !== msg.id) };
                                  }
                                  return c;
                                }));
                              }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Apagar para mim</button>`;

const replaceApagarMim = `                              <button onClick={async () => {
                                try {
                                  await fetch(\`/api/whatsapp/message?messageId=\${msg.id}&number=\${chat.remoteJid.replace("@s.whatsapp.net", "")}&localOnly=true\`, { method: 'DELETE' });
                                  setActiveMessageMenu(null);
                                  setChats(prev => prev.map(c => {
                                    if (c.id === activeChat.id) {
                                      return { ...c, messages: c.messages.filter((m: any) => m.id !== msg.id) };
                                    }
                                    return c;
                                  }));
                                } catch(e) { alert("Erro ao apagar"); }
                              }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Apagar para mim</button>`;

c = c.replace(targetApagarMim, replaceApagarMim);

// 2. Remove duplicated ContactNotes block
let lines = c.split(/\r?\n/);
let lastContactNotesIdx = -1;
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('<ContactNotes contactId=')) {
        lastContactNotesIdx = i;
        break;
    }
}

if (lastContactNotesIdx !== -1) {
    // The duplicate block is around lastContactNotesIdx
    // Search upwards for "Observações"
    let startIdx = -1;
    for (let i = lastContactNotesIdx; i >= Math.max(0, lastContactNotesIdx - 20); i--) {
        if (lines[i].includes('toggleSection(\'notes\')') || lines[i].includes('{/* Observações */}')) {
            startIdx = i;
            if (lines[i-1] && lines[i-1].includes('{/* Observações */}')) startIdx = i-1;
            break;
        }
    }
    
    // Search downwards for closing div
    let endIdx = -1;
    for (let i = lastContactNotesIdx; i < lines.length; i++) {
        if (lines[i].includes('</div>') && lines[i+1] && lines[i+1].includes(')}')) {
            endIdx = i + 2; // include closing div of the block
            if (lines[i+2] && lines[i+2].trim() === '</div>') endIdx = i + 2;
            break;
        }
    }
    
    if (startIdx !== -1 && endIdx !== -1 && startIdx > 500) { // ensure we are at the bottom
        console.log("Removing duplicate block from line " + startIdx + " to " + endIdx);
        lines.splice(startIdx, endIdx - startIdx + 1);
        c = lines.join('\n');
    }
}

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed Apagar para mim and removed duplicate notes block');
