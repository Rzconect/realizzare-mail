const fs = require('fs');
let c = fs.readFileSync('src/app/api/whatsapp/message/route.ts', 'utf8');

c = c.replace(/const remoteJid = searchParams\.get\("remoteJid"\);/g, 'const remoteJid = searchParams.get("remoteJid") || searchParams.get("number");');

// Add Supabase DB deletion!
const target = `const data = await response.json();`;
const replacement = `const data = await response.json();
    
    // Also delete from Supabase DB to prevent it from coming back
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    await supabaseAdmin.from('whatsapp_messages').delete().eq('message_id', messageId);
`;
c = c.replace(target, replacement);

fs.writeFileSync('src/app/api/whatsapp/message/route.ts', c);
console.log('Fixed API message route');
