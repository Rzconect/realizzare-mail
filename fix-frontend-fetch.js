const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const targetFetch = `      // Call real API
      try {
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: chat.id,
            remoteJid: chat.remoteJid,
            text: textToSend
          })
        });`;

const replacementFetch = `      // Call real API
      try {
        const quoted = replyingTo;
        setReplyingTo(null);

        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: chat.id,
            remoteJid: chat.remoteJid,
            text: textToSend,
            options: quoted ? { quoted: { messageId: quoted.id } } : undefined
          })
        });`;

c = c.replace(targetFetch, replacementFetch);
fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed Frontend Fetch payload');
