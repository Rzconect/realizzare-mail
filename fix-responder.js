const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(
  'const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);',
  `const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);`
);

c = c.replace(
  /alert\("Responder ainda não implementado\."\);/g,
  'setReplyingTo(msg);'
);

// We need to add quoting to the UI input area
const targetInput = `<form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2 relative">`;
          
const replacementInput = `<form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
          {replyingTo && (
            <div className="flex items-center justify-between bg-slate-50 border-l-4 border-indigo-500 rounded-lg p-2.5 mb-2 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-indigo-700">{replyingTo.isMine ? "Você" : "Cliente"}</span>
                <span className="text-xs text-slate-600 truncate max-w-md">{replyingTo.text}</span>
              </div>
              <button type="button" onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 relative">`;

c = c.replace(targetInput, replacementInput);

// Pass quoting to send payload
const fetchTarget = `fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: chat.phone, text: textToSend })
      });`;
      
const fetchReplacement = `
      // Capture local quoting so we can reset UI instantly
      const quoted = replyingTo;
      setReplyingTo(null);

      fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          number: chat.phone, 
          text: textToSend,
          options: quoted ? {
            quoted: {
              messageId: quoted.id
            }
          } : undefined
        })
      });`;

c = c.replace(fetchTarget, fetchReplacement);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed Reply UI');
