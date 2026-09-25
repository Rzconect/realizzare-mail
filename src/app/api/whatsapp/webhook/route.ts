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
      
      let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
      let messageType = 'text';
      let mimetype = '';
      let base64Media = msg.base64 || body.data?.base64 || body.base64 || "";

      if (msg.message?.imageMessage) {
        messageType = 'image';
        mimetype = msg.message.imageMessage.mimetype || 'image/jpeg';
        text = msg.message.imageMessage.caption || text;
      } else if (msg.message?.audioMessage) {
        messageType = 'audio';
        mimetype = msg.message.audioMessage.mimetype || 'audio/ogg';
      } else if (msg.message?.documentMessage) {
        messageType = 'document';
        mimetype = msg.message.documentMessage.mimetype || 'application/pdf';
        text = msg.message.documentMessage.fileName || msg.message.documentMessage.caption || text;
      } else if (msg.message?.videoMessage) {
        messageType = 'video';
        mimetype = msg.message.videoMessage.mimetype || 'video/mp4';
        text = msg.message.videoMessage.caption || text;
      } else if (msg.message?.stickerMessage) {
        messageType = 'image';
        mimetype = msg.message.stickerMessage.mimetype || 'image/webp';
      }

      let quotedContext = '';
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = msg.message.extendedTextMessage.contextInfo;
        const quotedId = quotedMsg.stanzaId || '';
        const quotedParticipant = quotedMsg.participant || '';
        let quotedText = quotedMsg.quotedMessage?.conversation || quotedMsg.quotedMessage?.extendedTextMessage?.text || 'Mensagem';
        quotedText = quotedText.replace(/\n/g, ' ').substring(0, 60);
        quotedContext = `[QUOTE:${quotedId}|${quotedParticipant}|${quotedText}]\n`;
      }
      text = quotedContext + text;

      if (!text && messageType === 'text') {
        return NextResponse.json({ success: true }); // Ignore empty non-media
      }

      const isFromMe = msg.key.fromMe;
      // Only use pushName if the message is from the contact (not fromMe)
      const contactName = !isFromMe && msg.pushName ? msg.pushName : phone;

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
            name: contactName,
            status: 'Aberto'
          })
          .select()
          .single();
          
        if (chatError) throw chatError;
        chat = newChat;
      } else {
        // Update last message time
        const updatePayload: any = { last_message_time: new Date().toISOString() };
        if (!isFromMe && msg.pushName && msg.pushName !== chat.name && msg.pushName !== phone) {
          updatePayload.name = msg.pushName;
        }

        await supabaseAdmin
          .from('whatsapp_chats')
          .update(updatePayload)
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

        let finalMessageText = text;
        if (messageType !== 'text') {
          let publicUrl = '';
          try {
            // Se base64 nao veio no webhook, tentamos buscar via endpoint
            if (!base64Media) {
              const instanceName = body.instance || 'RealizzareCRM';
              const mediaReq = await fetch(`https://evolution-api-production-8158.up.railway.app/chat/getBase64FromMediaMessage/${instanceName}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': 'RealizzareSenhaSecreta2026'
                },
                body: JSON.stringify({ message: msg })
              });
              
              if (mediaReq.ok) {
                const mediaRes = await mediaReq.json();
                base64Media = mediaRes.base64 || mediaRes.data?.base64 || '';
              }
            }

            if (base64Media) {
              const buffer = Buffer.from(base64Media, 'base64');
              const ext = mimetype.split('/')[1]?.split(';')[0] || 'bin';
              const fileName = `media_${msg.key.id}.${ext}`;
              
              const { error: uploadError } = await supabaseAdmin
                 .storage
                 .from('whatsapp_media')
                 .upload(fileName, buffer, { contentType: mimetype, upsert: true });
                 
              if (!uploadError) {
                 const { data: { publicUrl: url } } = supabaseAdmin
                    .storage
                    .from('whatsapp_media')
                    .getPublicUrl(fileName);
                 publicUrl = url;
              }
            }
          } catch (e) {
            console.error("Failed to process media:", e);
          }
          
          const mediaTag = messageType === 'audio' ? '[MEDIA:audio]' : messageType === 'document' ? '[MEDIA:document]' : '[MEDIA:image]';
          finalMessageText = `${mediaTag} ${publicUrl || 'Mídia_Indisponível'}\n${text}`.trim();
        }

        await supabaseAdmin
          .from('whatsapp_messages')
          .insert({
            chat_id: chat.id,
            message_id: msg.key.id,
            text: finalMessageText,
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
