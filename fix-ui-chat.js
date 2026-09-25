const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/<form onSubmit=\{handleSendMessage\}/, `{replyingTo && (
                  <div className="flex items-center justify-between bg-slate-100 rounded-xl p-2 mb-2 border-l-4 border-indigo-500">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-indigo-600">Respondendo a {replyingTo.sender === 'agent' ? 'Você' : replyingTo.sender === 'bot' ? 'Bot' : activeChat.name}</span>
                      <span className="text-xs text-slate-600 truncate">{replyingTo.text}</span>
                    </div>
                    <button type="button" onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                  </div>
                )}
                {editingMessage && (
                  <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-2 mb-2 border-l-4 border-emerald-500">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-emerald-600">Editando mensagem</span>
                      <span className="text-xs text-slate-600 truncate">{editingMessage.text}</span>
                    </div>
                    <button type="button" onClick={() => { setEditingMessage(null); setMessageText(""); }} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                  </div>
                )}
                <form onSubmit={handleSendMessage}`);

const renderBotMenuRegex = /<div className=\{`absolute right-2 \$\{msgIndex >= activeChat\.messages\.length - 2 \? 'bottom-8' : 'top-8'\} w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden`\}>[\s\S]*?<\/div>/g;

let menuHtml = `<div className={\`absolute right-2 \${msgIndex >= activeChat.messages.length - 2 ? 'bottom-8' : 'top-8'} w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden\`}>
        <button onClick={() => { setActiveMessageMenu(null); setReplyingTo(msg); document.querySelector('textarea')?.focus(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Responder</button>
        <button onClick={() => { setActiveMessageMenu(null); alert('Encaminhar ainda não implementado.'); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Encaminhar</button>
        {isMine && <button onClick={() => { setActiveMessageMenu(null); setEditingMessage(msg); setMessageText(msg.text); document.querySelector('textarea')?.focus(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Editar</button>}
        
        <button onClick={() => {
          setActiveMessageMenu(null);
          setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, messages: c.messages.filter((m: any) => m.id !== msg.id) } : c));
        }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">Apagar para mim</button>
        
        {isMine && <button onClick={async () => {
          setActiveMessageMenu(null);
          setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, messages: c.messages.filter((m: any) => m.id !== msg.id) } : c));
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
          supabase.from('whatsapp_messages').delete().eq('id', msg.id).then();
        }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100">Apagar para todos</button>}
      </div>`;

c = c.replace(renderBotMenuRegex, menuHtml);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed UI in conversations/page.tsx');
