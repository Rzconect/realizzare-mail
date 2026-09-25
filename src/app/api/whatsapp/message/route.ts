import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");
    const remoteJid = searchParams.get("remoteJid") || searchParams.get("number");
    const type = searchParams.get("type"); // 'everyone' or 'me'

    if (!messageId || !remoteJid) {
      return NextResponse.json({ success: false, error: "Faltam parâmetros" }, { status: 400 });
    }

    const instanceName = "RealizzareCRM";
    const apiKey = "RealizzareSenhaSecreta2026";
    const baseUrl = "https://evolution-api-production-8158.up.railway.app";

    let data = { localOnly: true };
    const localOnly = searchParams.get("localOnly") === "true";
    
    if (!localOnly && type === 'everyone') {
      const response = await fetch(`${baseUrl}/chat/deleteMessageForEveryone/${instanceName}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey || ""
        },
        body: JSON.stringify({
          id: messageId,
          fromMe: true,
          remoteJid: remoteJid.includes('@') ? remoteJid : `${remoteJid}@s.whatsapp.net`
        })
      });
      data = await response.json();
    }
    
    // Deleta do Supabase DB
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    await supabaseAdmin.from('whatsapp_messages').delete().eq('message_id', messageId);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { messageId, remoteJid, newText } = body;

    if (!messageId || !remoteJid || !newText) {
      return NextResponse.json({ success: false, error: "Faltam parâmetros" }, { status: 400 });
    }

    const instanceName = "RealizzareCRM";
    const apiKey = "RealizzareSenhaSecreta2026";
    const baseUrl = "https://evolution-api-production-8158.up.railway.app";
    
    const formattedJid = remoteJid.includes('@') ? remoteJid : `${remoteJid}@s.whatsapp.net`;

    const response = await fetch(`${baseUrl}/chat/updateMessage/${instanceName}`, {
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
    });
    
    const data = await response.json();
    
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
      const quoteMatch = existingMsg.text.match(/^\[QUOTE:(.*?)\|(.*?)\|(.*?)\]\n/);
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
      .eq('message_id', messageId);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error updating message:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
