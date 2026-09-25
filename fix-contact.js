const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const regex = /\{msg\.quotedParticipant\?\.includes\(currentUser\?\.phone\) \|\| msg\.quotedParticipant === '' \? 'Você' : 'Contato'\}/g;
const replacement = `{msg.quotedParticipant?.includes(currentUser?.phone) || msg.quotedParticipant === '' ? 'Você' : activeChat.name}`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed contact name');
