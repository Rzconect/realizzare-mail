import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const { secretKey, createdSince } = await req.json();

    if (!secretKey) {
      return NextResponse.json({ error: "Secret Key do Pagar.me não fornecida." }, { status: 400 });
    }

    const startDate = createdSince || "2026-08-01T00:00:00Z";
    console.log(`--> Sincronizando histórico do Pagar.me desde ${startDate}...`);

    // Call Pagar.me V5 API
    const authHeader = "Basic " + Buffer.from(secretKey + ":").toString("base64");
    
    let pagarmeOrders: any[] = [];
    try {
      const pagRes = await fetch(`https://api.pagar.me/core/v5/orders?created_since=${encodeURIComponent(startDate)}&status=paid`, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json"
        }
      });

      if (pagRes.ok) {
        const pagData = await pagRes.json();
        pagarmeOrders = pagData?.data || [];
      } else {
        console.warn("Resposta Pagar.me API:", pagRes.status);
      }
    } catch (e) {
      console.warn("Erro de conexão Pagar.me API:", e);
    }

    let syncedCount = 0;
    let totalRevenueSynced = 0;

    const supabase = createClient();

    for (const order of pagarmeOrders) {
      const customer = order?.customer || {};
      const email = (customer?.email || "").toLowerCase().trim();
      const name = customer?.name || "Aluno Realizzare";
      const items = order?.items || [];
      const itemTitle = items[0]?.description || items[0]?.name || "Certificado / Curso Realizzare";
      const amountInCents = order?.amount || order?.total_amount || 4990;
      const amountInReais = amountInCents / 100;

      if (!email) continue;

      syncedCount++;
      totalRevenueSynced += amountInReais;

      const lowerTitle = itemTitle.toLowerCase();
      let category: "certificado" | "curso" | "assinatura" = "certificado";
      if (lowerTitle.includes("assinatura") || lowerTitle.includes("plano")) category = "assinatura";
      else if (lowerTitle.includes("curso")) category = "curso";

      try {
        await supabase.from("reporting_events").insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          contact_email: email,
          event_type: "purchase",
          created_at: order.created_at || new Date().toISOString(),
          metadata: {
            provider: "pagarme",
            event: "order.paid",
            item_title: itemTitle,
            amount: amountInReais,
            category: category,
            customer_name: name
          }
        });
      } catch (dbErr) {
        console.warn("Notice DB insert:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      syncedOrdersCount: syncedCount,
      totalRevenueSynced: totalRevenueSynced,
      message: `Sincronização concluída! ${syncedCount} transações do Pagar.me importadas a partir de 01/08/2026.`
    }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na sincronização:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
