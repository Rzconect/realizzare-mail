const fs = require('fs');
let c = fs.readFileSync('src/app/api/whatsapp/webhook/route.ts', 'utf8');

const regex = /if \(!text && messageType === 'text'\) \{/;
const replacement = `let quotedContext = '';
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = msg.message.extendedTextMessage.contextInfo;
        const quotedId = quotedMsg.stanzaId || '';
        const quotedParticipant = quotedMsg.participant || '';
        let quotedText = quotedMsg.quotedMessage?.conversation || quotedMsg.quotedMessage?.extendedTextMessage?.text || 'Mensagem';
        quotedText = quotedText.replace(/\\n/g, ' ').substring(0, 60);
        quotedContext = \`[QUOTE:\${quotedId}|\${quotedParticipant}|\${quotedText}]\\n\`;
      }
      text = quotedContext + text;

      if (!text && messageType === 'text') {`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/app/api/whatsapp/webhook/route.ts', c);
console.log('Added quoted message extraction');
