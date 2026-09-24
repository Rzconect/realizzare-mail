import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");
    const remoteJid = searchParams.get("remoteJid");

    if (!messageId || !remoteJid) {
      return NextResponse.json({ success: false, error: "Faltam parâmetros" }, { status: 400 });
    }

    const instanceName = "RealizzareCRM";
    const apiKey = "RealizzareSenhaSecreta2026";
    const baseUrl = "https://evolution-api-production-8158.up.railway.app";

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

    const data = await response.json();
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
