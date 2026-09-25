const fs = require('fs');
let c = fs.readFileSync('src/app/api/whatsapp/message/route.ts', 'utf8');

const regex = /const data = await response\.json\(\);\s*\/\/ Atualiza no Supabase DB\s*const \{ createClient \} = require\("@supabase\/supabase-js"\);\s*const supabaseAdmin = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL,\s*process\.env\.SUPABASE_SERVICE_ROLE_KEY\s*\);\s*await supabaseAdmin\.from\('whatsapp_messages'\)\s*\.update\(\{ text: newText \}\)\s*\.eq\('message_id', messageId\);/m;

const replacement = `const data = await response.json();
    
    // Atualiza no Supabase DB
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Check if the original message had a quote prefix
    const { data: existingMsg } = await supabaseAdmin.from('whatsapp_messages').select('text').eq('message_id', messageId).single();
    let prefix = '';
    if (existingMsg && existingMsg.text) {
      const quoteMatch = existingMsg.text.match(/^\\[QUOTE:(.*?)\\|(.*?)\\|(.*?)\\]\\n/);
      if (quoteMatch) {
        prefix = quoteMatch[0];
      }
    }
    
    // Append [EDITADA] if not already present in newText (just in case)
    let finalNewText = newText;
    if (!finalNewText.endsWith('[EDITADA]')) {
      finalNewText = finalNewText + '[EDITADA]';
    }
    
    await supabaseAdmin.from('whatsapp_messages')
      .update({ text: prefix + finalNewText })
      .eq('message_id', messageId);`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/app/api/whatsapp/message/route.ts', c);
console.log('Fixed PUT edit metadata');
