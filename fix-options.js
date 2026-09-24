const fs = require('fs');

let c = fs.readFileSync('src/app/api/whatsapp/send/route.ts', 'utf8');

c = c.replace(
  'const { chatId, remoteJid, text } = await req.json();',
  'const { chatId, remoteJid, text, options } = await req.json();'
);

fs.writeFileSync('src/app/api/whatsapp/send/route.ts', c);
console.log('Fixed options in send API');
