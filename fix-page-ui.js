const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const mapBlock = `messages: sortedMessages.map((m: any) => {
                let isQuoted = false;
                let quotedId = '', quotedParticipant = '', quotedText = '';
                let displayText = m.text || '';
                const quoteMatch = displayText.match(/^\\[QUOTE:(.*?)\\|(.*?)\\|(.*?)\\]\\n/);
                if (quoteMatch) {
                  isQuoted = true;
                  quotedId = quoteMatch[1];
                  quotedParticipant = quoteMatch[2];
                  quotedText = quoteMatch[3];
                  displayText = displayText.replace(/^\\[QUOTE:(.*?)\\|(.*?)\\|(.*?)\\]\\n/, '');
                }
                
                return {
                  id: m.id,
                  messageId: m.message_id,
                  sender: m.sender === 'user' ? 'client' : m.sender,
                  text: displayText,
                  isQuoted,
                  quotedId,
                  quotedParticipant,
                  quotedText,
                  time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
              })`;

c = c.replace(/messages: sortedMessages\.map\(\(m: any\) => \(\{[\s\S]*?\}\)\)/, mapBlock);

const sendTextFix = `// Handle Edit via API`;
// We don't need to change edit, it's fine. 

// Update Reply handling
const oldReplyBlock = `let textToSend = messageText;
    if (replyingTo) {
      const shortReply = replyingTo.text.substring(0, 30) + (replyingTo.text.length > 30 ? "..." : "");
      textToSend = \`[Respondendo a: \${shortReply}]\\n\\n\` + textToSend;
      setReplyingTo(null);
    }`;

const newReplyBlock = `let textToSend = messageText;
    const currentReplyingTo = replyingTo;
    if (replyingTo) {
      setReplyingTo(null);
    }`;
    
c = c.replace(oldReplyBlock, newReplyBlock);

// Send message payload
const fetchRegex = /fetch\('\/api\/whatsapp\/send', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{\s*chatId: activeChatId,\s*remoteJid: chat\.phone,\s*text: textToSend\s*\}\)/;

const fetchReplacement = `fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeChatId,
          remoteJid: chat.phone,
          text: textToSend,
          options: currentReplyingTo ? { quoted: { key: { id: currentReplyingTo.messageId || currentReplyingTo.id, remoteJid: chat.phone, fromMe: currentReplyingTo.sender === 'agent' } } } : undefined
        })
      })`;
c = c.replace(fetchRegex, fetchReplacement);

// Fix UI Rendering for Quoted text
const renderMsgRegex = /<div className="text-sm">\{msg\.text\}<\/div>/g;
const renderMsgReplacement = `{msg.isQuoted && (
                        <div onClick={() => {
                          const el = document.getElementById('msg-' + msg.quotedId);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }} className={\`mb-1 p-2 rounded-lg text-xs border-l-4 cursor-pointer transition-colors \${msg.sender === 'agent' || msg.sender === 'bot' ? 'bg-emerald-700/20 border-emerald-900/50 hover:bg-emerald-700/30' : 'bg-slate-200 border-slate-400 hover:bg-slate-300'}\`}>
                          <div className={\`font-bold mb-1 \${msg.sender === 'agent' || msg.sender === 'bot' ? 'text-emerald-900' : 'text-indigo-600'}\`}>
                            {msg.quotedParticipant.includes(currentUser?.phone) || msg.quotedParticipant === '' ? 'Você' : 'Contato'}
                          </div>
                          <div className="text-slate-600 line-clamp-3 break-words">{msg.quotedText}</div>
                        </div>
                      )}
                      <div className="text-sm break-words whitespace-pre-wrap">{msg.text}</div>`;
c = c.replace(renderMsgRegex, renderMsgReplacement);

// Add id to message bubble
const bubbleRegex = /<div\s+key=\{msgIndex\}\s+className=\{`flex flex-col mb-4/g;
const bubbleReplacement = `<div key={msgIndex} id={\`msg-\${msg.messageId || msg.id}\`} className={\`flex flex-col mb-4`;
c = c.replace(bubbleRegex, bubbleReplacement);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed page.tsx');
