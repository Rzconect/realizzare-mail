const fs = require('fs');
let c = fs.readFileSync('src/app/api/whatsapp/message/route.ts', 'utf8');

const regex = /const response = await fetch\(\`\$\{baseUrl\}\/chat\/updateMessage\/\$\{instanceName\}\`, \{\s*method: "POST",\s*headers: \{\s*"Content-Type": "application\/json",\s*"apikey": apiKey \|\| ""\s*\},\s*body: JSON\.stringify\(\{\s*number: remoteJid\.replace\("@s\.whatsapp\.net", ""\),\s*key: \{\s*id: messageId,\s*fromMe: true,\s*remoteJid: formattedJid\s*\},\s*message: \{\s*text: newText\s*\}\s*\}\)\s*\}\);/;

const replacement = `const response = await fetch(\`\$\{baseUrl\}/message/sendText/\$\{instanceName\}\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey || ""
      },
      body: JSON.stringify({
        number: remoteJid.replace("@s.whatsapp.net", ""),
        text: newText,
        options: {
          delay: 0,
          editMessageId: messageId
        },
        edit: {
          id: messageId,
          fromMe: true,
          remoteJid: formattedJid
        }
      })
    });`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/app/api/whatsapp/message/route.ts', c);
console.log('Fixed PUT edit');
