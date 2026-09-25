const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const target = `.from('whatsapp_chats')
          .select('*, whatsapp_messages(*)')
          .order('last_message_time', { ascending: false });`;

const replacement = `.from('whatsapp_chats')
          .select('*, whatsapp_messages(*)')
          .order('last_message_time', { ascending: false })
          .order('created_at', { foreignTable: 'whatsapp_messages', ascending: false })
          .limit(50, { foreignTable: 'whatsapp_messages' });`;

c = c.replace(target, replacement);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed message limit');
