import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { chatId, remoteJid, text } = await req.json();

    if (!chatId || !remoteJid || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call Evolution API to send the message
    const evoUrl = 'https://evolution-api-production-8158.up.railway.app';
    const apiKey = 'RealizzareSenhaSecreta2026'; // This should ideally be in .env

    const response = await fetch(`${evoUrl}/message/sendText/RealizzareCRM`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: remoteJid,
        options: { delay: 1200, presence: "composing" },
        textMessage: { text: text }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send message via Evolution API:', errorText);
      return NextResponse.json({ error: 'Evolution API Error' }, { status: 500 });
    }

    const evoData = await response.json();

    // Insert the sent message into Supabase
    // Note: Evolution API Webhook (messages.upsert fromMe:true) MIGHT also fire for this message.
    // To prevent duplicates, we use the message_id returned by Evolution API (if any), 
    // or we just rely entirely on the Webhook to save the message!
    // Actually, relying on the webhook for sent messages is safer to ensure it really went out.
    // But for immediate UI feedback, we can save it here, and the webhook will just ignore it 
    // since the message_id will already be in the database.

    const msgId = evoData.key?.id || `local-${Date.now()}`;

    await supabaseAdmin
      .from('whatsapp_messages')
      .insert({
        chat_id: chatId,
        message_id: msgId,
        text: text,
        sender: 'agent', // from the system
      });

    // Update chat last message time
    await supabaseAdmin
      .from('whatsapp_chats')
      .update({ last_message_time: new Date().toISOString() })
      .eq('id', chatId);

    return NextResponse.json({ success: true, messageId: msgId });
  } catch (error) {
    console.error('Send Message Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
