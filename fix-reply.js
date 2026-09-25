const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const regex = /options: currentReplyingTo \? \{ quoted: \{ key: \{ id: currentReplyingTo\.messageId \|\| currentReplyingTo\.id, remoteJid: chat\.remoteJid, fromMe: currentReplyingTo\.sender === 'agent' \} \} \} : undefined/g;
const replacement = `options: currentReplyingTo ? { quoted: { messageId: currentReplyingTo.messageId || currentReplyingTo.id, key: { id: currentReplyingTo.messageId || currentReplyingTo.id, remoteJid: chat.remoteJid, fromMe: currentReplyingTo.sender === 'agent' } } } : undefined`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed reply in page.tsx');
