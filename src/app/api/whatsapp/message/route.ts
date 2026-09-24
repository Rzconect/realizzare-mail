import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");
    const remoteJid = searchParams.get("remoteJid") || searchParams.get("number");

    if (!messageId || !remoteJid) {
      return NextResponse.json({ success: false, error: "Faltam parâmetros" }, { status: 400 });
    }

    const instanceName = "RealizzareCRM";
    const apiKey = "RealizzareSenhaSecreta2026";
    const baseUrl = "https://evolution-api-production-8158.up.railway.app";

    let data = { localOnly: true };
    const localOnly = searchParams.get("localOnly") === "true";
    if (!localOnly) {
      const response = await fetch(`${baseUrl}/chat/deleteMessage/${instanceName}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey || ""
        },
        body: JSON.stringify({
          number: remoteJid.replace("@s.whatsapp.net", ""),
          messageId: messageId
        })
      });
      data = await response.json();
    }
    
    // Also delete from Supabase DB to prevent it from coming back
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
