const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const fetchRegex = /options: currentReplyingTo \? \{ quoted: \{ messageId: currentReplyingTo\.messageId \|\| currentReplyingTo\.id, key: \{ id: currentReplyingTo\.messageId \|\| currentReplyingTo\.id, remoteJid: chat\.remoteJid, fromMe: currentReplyingTo\.sender === 'agent' \} \} \} : undefined/g;

const replacement = `options: currentReplyingTo ? { quoted: { key: { id: currentReplyingTo.messageId || currentReplyingTo.id, remoteJid: chat.remoteJid.includes('@') ? chat.remoteJid : chat.remoteJid + '@s.whatsapp.net', fromMe: currentReplyingTo.sender === 'agent' }, message: { conversation: currentReplyingTo.quotedText || currentReplyingTo.text } } } : undefined`;

c = c.replace(fetchRegex, replacement);
fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed reply options payload');
