import { NextResponse } from "next/server";

// Daily Cron Handler (Runs at 00:00 every day)
export async function GET(req: Request) {
  try {
    console.log("--> Executando Cron Diário de Sincronização Pagar.me (00:00)...");
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const syncRes = await fetch(`${baseUrl}/api/integrations/sync-pagarme`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCronTriggered: true })
    });

    const data = await syncRes.json();

    return NextResponse.json({
      cronStatus: "executed",
      timestamp: new Date().toISOString(),
      syncResult: data
    }, { status: 200 });
  } catch (error: any) {
    console.error("Erro na execução do Cron Diário Pagar.me:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
