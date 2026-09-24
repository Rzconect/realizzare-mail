const fs = require('fs');

let c = fs.readFileSync('src/app/api/whatsapp/send/route.ts', 'utf8');

c = c.replace(
  'const { number, text } = await request.json();',
  'const { number, text, options } = await request.json();'
);

c = c.replace(
  /body: JSON\.stringify\(\{\s*number: remoteJid,\s*text: text\s*\}\)/,
  `body: JSON.stringify({
          number: remoteJid,
          text: text,
          options: options
        })`
);

fs.writeFileSync('src/app/api/whatsapp/send/route.ts', c);
console.log('Fixed send API with options');
