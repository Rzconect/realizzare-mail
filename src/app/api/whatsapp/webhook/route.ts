import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log for debugging
    console.log("Recebido Webhook WhatsApp:", JSON.stringify(body, null, 2));

    if (body.event === 'messages.upsert' || body.event === 'MESSAGES_UPSERT') {
      let msg = body.data;
      if (body.data?.messages && body.data.messages[0]) {
        msg = body.data.messages[0];
      } else if (body.data?.message && body.data.message.key) {
        msg = body.data.message;
      }
      if (!msg || !msg.key) {
        console.error("Mensagem sem key:", JSON.stringify(body));
        return NextResponse.json({ success: true });
      }

      const remoteJid = msg.key.remoteJid;
      if (remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') {
        return NextResponse.json({ success: true }); // Ignore groups and status
      }

      const phone = remoteJid.split('@')[0];
      const pushName = msg.pushName || phone;
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
      const isFromMe = msg.key.fromMe;
      
      if (!text) return NextResponse.json({ success: true }); // Ignore non-text for now

      // 1. Check if chat exists
      let { data: chat } = await supabaseAdmin
        .from('whatsapp_chats')
        .select('*')
        .eq('remote_jid', remoteJid)
        .single();

      if (!chat) {
        // Create new chat
        const { data: newChat, error: chatError } = await supabaseAdmin
          .from('whatsapp_chats')
          .insert({
            remote_jid: remoteJid,
            phone: phone,
            name: pushName,
            status: 'Aberto'
          })
          .select()
          .single();
          
        if (chatError) throw chatError;
        chat = newChat;
      } else {
        // Update last message time
        await supabaseAdmin
          .from('whatsapp_chats')
          .update({ 
            last_message_time: new Date().toISOString(),
            name: pushName !== phone ? pushName : chat.name // update name if changed
          })
          .eq('id', chat.id);
      }

      // 2. Check if message already exists
      const { data: existingMsg } = await supabaseAdmin
        .from('whatsapp_messages')
        .select('id')
        .eq('message_id', msg.key.id)
        .single();

      if (!existingMsg && chat) {
        // Convert timestamp (Baileys uses Unix seconds)
        const msgTime = new Date(
          (msg.messageTimestamp > 10000000000 ? msg.messageTimestamp / 1000 : msg.messageTimestamp) * 1000
        ).toISOString();

        await supabaseAdmin
          .from('whatsapp_messages')
          .insert({
            chat_id: chat.id,
            message_id: msg.key.id,
            text: text,
            sender: isFromMe ? 'agent' : 'user',
            created_at: msgTime
          });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
