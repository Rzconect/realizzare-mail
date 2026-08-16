import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("--> Webhook Pagar.me recebido:", body?.type || body?.event);

    const eventType = body?.type || body?.event || "order.paid";
    const data = body?.data || body;

    // Extract customer details
    const customer = data?.customer || {};
    const email = (customer?.email || data?.email || "").toLowerCase().trim();
    const name = customer?.name || data?.name || "Aluno Realizzare";
    const phone = customer?.phones?.mobile_phone?.number || customer?.phone || "";

    if (!email) {
      return NextResponse.json({ message: "Webhook ignorado: e-mail não informado." }, { status: 200 });
    }

    // Extract transaction items and amount
    const items = data?.items || [];
    const itemTitle = data?.metadata?.course_name || 
                      data?.metadata?.course || 
                      items[0]?.description || 
                      items[0]?.name || 
                      data?.description || 
                      "Certificado / Curso Realizzare";
    const amountInCents = data?.amount || data?.total_amount || 4990;
    const amountInReais = (amountInCents / 100).toFixed(2);

    // Determine event classification
    const lowerTitle = itemTitle.toLowerCase();
    let category: "certificado" | "curso" | "assinatura" = "certificado";
    if (lowerTitle.includes("assinatura") || lowerTitle.includes("plano") || eventType.includes("subscription")) {
      category = "assinatura";
    } else if (lowerTitle.includes("curso") || lowerTitle.includes("formação")) {
      category = "curso";
    }

    // Log transaction event & register contact to "Clientes" list
    try {
      const supabase = createClient();
      
      // 1. Log the purchase event
      await supabase.from("reporting_events").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        contact_email: email,
        event_type: "purchase",
        metadata: {
          provider: "pagarme",
          event: eventType,
          item_title: itemTitle,
          amount: parseFloat(amountInReais),
          category: category,
          customer_name: name,
          phone: phone
        }
      });

      // 2. Find or create the contact in Supabase
      let contactId = null;
      const { data: existingContact } = await supabase
        .from("contacts")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingContact) {
        contactId = existingContact.id;
      } else {
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "Cliente";
        const lastName = nameParts.slice(1).join(" ") || "Realizzare";
        
        const { data: newContact } = await supabase
          .from("contacts")
          .insert({
            org_id: "00000000-0000-0000-0000-000000000001",
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            status: "active",
            source: "pagarme"
          })
          .select("id")
          .single();
        if (newContact) {
          contactId = newContact.id;
        }
      }

      // 3. Associate with "Clientes" list in list_subscriptions
      if (contactId) {
        const { data: listData } = await supabase
          .from("lists")
          .select("id")
          .eq("name", "Clientes")
          .maybeSingle();
        
        if (listData) {
          await supabase
            .from("list_subscriptions")
            .upsert({
              contact_id: contactId,
              list_id: listData.id,
              status: "subscribed"
            }, {
              onConflict: "contact_id,list_id"
            });
        }
      }
    } catch (dbErr) {
      console.warn("Supabase log/subscription notice:", dbErr);
    }

    return NextResponse.json({
      success: true,
      provider: "pagarme",
      event: eventType,
      customer: { name, email },
      item: itemTitle,
      amount: amountInReais,
      category: category,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error("Erro no processamento do Webhook Pagar.me:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    provider: "Pagar.me V5 / Stone",
    endpoint: "/api/webhooks/pagarme",
    documentation: "Envie requisições POST com os eventos order.paid, charge.paid ou subscription.created."
  });
}
