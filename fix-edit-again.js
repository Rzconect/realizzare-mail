const fs = require('fs');
let c = fs.readFileSync('src/app/api/whatsapp/message/route.ts', 'utf8');

const regex = /const response = await fetch\(\`\$\{baseUrl\}\/message\/sendText\/\$\{instanceName\}\`, \{\s*method: "POST",\s*headers: \{\s*"Content-Type": "application\/json",\s*"apikey": apiKey \|\| ""\s*\},\s*body: JSON\.stringify\(\{\s*number: remoteJid\.replace\("@s\.whatsapp\.net", ""\),\s*text: newText,\s*options: \{\s*delay: 0,\s*editMessageId: messageId\s*\},\s*edit: \{\s*id: messageId,\s*fromMe: true,\s*remoteJid: formattedJid\s*\}\s*\}\)\s*\}\);/;

const replacement = `const response = await fetch(\`\$\{baseUrl\}/chat/updateMessage/\$\{instanceName\}\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey || ""
      },
      body: JSON.stringify({
        number: remoteJid.replace("@s.whatsapp.net", ""),
        key: {
          id: messageId,
          fromMe: true,
          remoteJid: formattedJid
        },
        text: newText
      })
    });`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/app/api/whatsapp/message/route.ts', c);
console.log('Fixed PUT edit to use updateMessage correctly');
