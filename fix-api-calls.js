const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const editBlockRegex = /if \(editingMessage\) \{[\s\S]*?return;\n\s+\}/;
c = c.replace(editBlockRegex, `if (editingMessage) {
      // Handle Edit via API
      fetch('/api/whatsapp/message', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: editingMessage.messageId || editingMessage.id, remoteJid: chat.phone, newText: messageText })
      }).catch(console.error);
      
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.map((m: any) => m.id === editingMessage.id ? { ...m, text: messageText } : m)
          };
        }
        return c;
      }));
      
      setMessageText("");
      setEditingMessage(null);
      return;
    }`);

const apagarTodosRegex = /\{isMine && <button onClick=\{async \(\) => \{[\s\S]*?supabase\.from\('whatsapp_messages'\)\.delete\(\)\.eq\('id', msg\.id\)\.then\(\);\n\s+\}\} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100">Apagar para todos<\/button>\}/g;

c = c.replace(apagarTodosRegex, `{isMine && <button onClick={async () => {
          setActiveMessageMenu(null);
          setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, messages: c.messages.filter((m: any) => m.id !== msg.id) } : c));
          fetch(\`/api/whatsapp/message?messageId=\${msg.messageId || msg.id}&remoteJid=\${activeChat.phone}&type=everyone\`, { method: 'DELETE' }).catch(console.error);
        }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100">Apagar para todos</button>}`);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed edit and delete in page.tsx');
