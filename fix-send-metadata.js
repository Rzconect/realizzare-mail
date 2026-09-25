const fs = require('fs');
let c = fs.readFileSync('src/app/api/whatsapp/send/route.ts', 'utf8');

const regex = /const msgId = evoData\.key\?\.id \|\| \`local-\$\{Date\.now\(\)\}\`;\s*await supabaseAdmin\s*\.from\('whatsapp_messages'\)\s*\.insert\(\{\s*chat_id: chatId,\s*message_id: msgId,\s*text: text,\s*sender: 'agent',/m;

const replacement = `const msgId = evoData.key?.id || \`local-\${Date.now()}\`;
    
    let finalText = text;
    if (options?.quoted?.key?.id) {
       const quotedId = options.quoted.key.id;
       const quotedParticipant = options.quoted.key.remoteJid || '';
       const quotedText = options.quoted.message?.conversation || 'Mensagem';
       finalText = \`[QUOTE:\${quotedId}|\${quotedParticipant}|\${quotedText.replace(/\\n/g, ' ').substring(0, 50)}]\n\` + text;
    }

    await supabaseAdmin
      .from('whatsapp_messages')
      .insert({
        chat_id: chatId,
        message_id: msgId,
        text: finalText,
        sender: 'agent',`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/app/api/whatsapp/send/route.ts', c);
console.log('Fixed send metadata');
