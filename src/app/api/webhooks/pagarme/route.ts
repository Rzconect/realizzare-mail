import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("--> Webhook Pagar.me recebido:", body?.type || body?.event);

    
    // ALWAYS LOG RAW PAYLOAD FOR DEBUGGING
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");
      await supabase.from("inbound_webhook_events").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        event_type: body?.type || body?.event || "unknown_pagarme",
        payload: body,
        created_at: new Date().toISOString()
      });
    } catch(e) {}

    const eventType = body?.type || body?.event || "order.paid";
    const data = body?.data || body;

    const validEvents = [
      "order.paid", "charge.paid", "subscription.activated", "subscription.created",
      "order.created", "order.pending", "charge.pending"
    ];
    if (!validEvents.includes(eventType)) {
      return NextResponse.json({ message: `Webhook ignorado: evento ${eventType} não processado.` }, { status: 200 });
    }

    let purchaseStatus = "paid";
    if (eventType.includes("pending") || eventType === "order.created") {
      purchaseStatus = "pending";
    }

    // Extract customer details & address
    const customer = data?.customer || {};
    const email = (customer?.email || data?.email || "").toLowerCase().trim();
    const name = customer?.name || data?.name || "Aluno Realizzare";
    const phone = customer?.phones?.mobile_phone?.number ? `(${customer.phones.mobile_phone.area_code || "11"}) ${customer.phones.mobile_phone.number}` : (customer?.phone || "");

    const address = customer?.address || 
                    data?.shipping?.address || 
                    data?.billing?.address || 
                    data?.charges?.[0]?.customer?.address || 
                    data?.charges?.[0]?.billing?.address || 
                    {};
    const city = address?.city || customer?.city || data?.city || "";
    const state = address?.state || customer?.state || data?.state || "";

    if (!email) {
      return NextResponse.json({ message: "Webhook ignorado: e-mail não informado." }, { status: 200 });
    }

    // Fetch product mapping early
    let productMapping: Record<string, string> = {};
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");
      const { data: settingsData } = await supabase
        .from("account_settings")
        .select("settings")
        .eq("org_id", "00000000-0000-0000-0000-000000000001")
        .maybeSingle();
      if (settingsData && settingsData.settings && (settingsData.settings as any).pagarme_product_mapping) {
        productMapping = (settingsData.settings as any).pagarme_product_mapping;
      }
    } catch(e) {}

    // Extract transaction items and amount
    const items = data?.items || data?.order?.items || [];
    
    // Check for mapped product by code
    const orderCode = data?.code || data?.order?.code || items[0]?.code || "";
    let mappedTitle = null;
    if (orderCode && Object.keys(productMapping).length > 0) {
      const parts = orderCode.split("-");
      // Se houver exatamente 3 partes (ex: 21534-172-3728), pegamos a do meio com precisão
      if (parts.length === 3) {
        const middleCode = parts[1];
        if (productMapping[middleCode]) {
          mappedTitle = productMapping[middleCode];
        }
      } else {
        // Fallback genérico caso fuja do padrão (pega a primeira que bater)
        for (const p of parts) {
          if (productMapping[p]) {
            mappedTitle = productMapping[p];
            break;
          }
        }
      }
    }

    // Default hardcoded mappings for standard certificate and subscription IDs
    if (!mappedTitle && orderCode) {
      const parts = orderCode.split("-");
      const defaultMap: Record<string, string> = {
        "1": "Certificado Digital",
        "2": "Certificado Digital + Impresso",
        "3": "Assinatura Mensal",
        "179": "Certificado Digital IES/MEC",
        "180": "Certificado Impresso IES/MEC"
      };
      // Check middle part first
      if (parts.length === 3 && defaultMap[parts[1]]) {
        mappedTitle = defaultMap[parts[1]];
      } else {
        // Fallback check all parts
        for (const p of parts) {
          if (defaultMap[p]) {
            mappedTitle = defaultMap[p];
            break;
          }
        }
      }
    }

    const itemTitle = mappedTitle || 
                      data?.metadata?.course_name || 
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

    const quantity = items[0]?.quantity || 1;
    let finalItemTitle = quantity > 1 ? `${itemTitle} (x${quantity})` : itemTitle;

    // Helper to recursively find coupon code in payload
    const findCoupon = (obj: any, depth = 0): string | null => {
      if (!obj || typeof obj !== 'object' || depth > 5) return null;
      for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase();
        if ((lowerKey === 'coupon' || lowerKey === 'cupom' || lowerKey === 'discount_code') && typeof obj[key] === 'string' && obj[key].trim()) {
          return obj[key];
        }
        if (typeof obj[key] === 'object') {
          const res = findCoupon(obj[key], depth + 1);
          if (res) return res;
        }
      }
      return null;
    };
    
    const couponCode = findCoupon(body);
    if (couponCode) {
      finalItemTitle += ` (Cupom: ${couponCode.toUpperCase()})`;
    }
    
    // Log transaction event & register contact to "Clientes" list
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // 1. Log the purchase event
      const pagarmeId = data?.id || `pagarme-webhook-${Date.now()}`;
      
      const { data: existingEvent } = await supabase
        .from("reporting_events")
        .select("id")
        .eq("contact_email", email)
        .eq("event_type", "purchase")
        .eq("metadata->>pagarme_id", pagarmeId)
        .maybeSingle();

      if (!existingEvent) {
        await supabase.from("reporting_events").insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          contact_email: email,
          event_type: "purchase",
          metadata: {
            provider: "pagarme",
            event: eventType,
            item_title: finalItemTitle,
            quantity: quantity,
            amount: parseFloat(amountInReais),
            category: category,
            customer_name: name,
            phone: phone,
            pagarme_id: pagarmeId
          }
        });
      }

      // 2. Find or create the contact in Supabase
      let contactId = null;
      const { data: existingContact } = await supabase
        .from("contacts")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingContact) {
        contactId = existingContact.id;
        const updatePayload: any = { status: "active", updated_at: new Date().toISOString() };
        if (city) updatePayload.city = city;
        if (state) updatePayload.state = state;
        if (phone) updatePayload.phone = phone;
        updatePayload.country = "Brasil";
        await supabase.from("contacts").update(updatePayload).eq("id", existingContact.id);
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
            city: city || null,
            state: state || null,
            country: "Brasil",
            status: "active",
            source: "pagarme"
          })
          .select("id")
          .single();
        if (newContact) {
          contactId = newContact.id;
        }
      }

      // 3. Log the purchase in purchases table
      if (contactId) {
        // Primary dedup: by Pagar.me SKU
        const { data: existingBySku } = await supabase
          .from("purchases")
          .select("id, status")
          .eq("sku", pagarmeId)
          .maybeSingle();

        // Secondary dedup: by contact + timestamp window + amount
        const nowMs = Date.now();
        const windowStart = new Date(nowMs - 60000).toISOString();
        const windowEnd = new Date(nowMs + 60000).toISOString();
        const { data: existingByTime } = await supabase
          .from("purchases")
          .select("id, status")
          .eq("contact_id", contactId)
          .eq("amount", parseFloat(amountInReais))
          .gte("created_at", windowStart)
          .lt("created_at", windowEnd)
          .maybeSingle();

        const existingRecord = existingBySku || existingByTime;

        if (!existingRecord) {
          const prodType = category === "assinatura" ? "subscription" : 
                           category === "curso" ? "course" : "certificate";
          
          await supabase.from("purchases").insert({
            org_id: "00000000-0000-0000-0000-000000000001",
            contact_id: contactId,
            product_type: prodType,
            product_name: finalItemTitle,
            amount: parseFloat(amountInReais),
            sku: pagarmeId,
            status: purchaseStatus,
            paid_at: purchaseStatus === "paid" ? new Date().toISOString() : null,
            created_at: new Date().toISOString()
          });
        } else if (existingRecord && existingRecord.status === "pending" && purchaseStatus === "paid") {
          // Update to paid
          await supabase.from("purchases").update({
            status: "paid",
            paid_at: new Date().toISOString()
          }).eq("id", existingRecord.id);
        }
      }

      // Load toggles from settings (default to false for Pagar.me unless specified)
      let leadsToAlunos = false;
      let autoClientes = true;
      try {
        const { data: settingsData } = await supabase
          .from("account_settings")
          .select("settings")
          .eq("org_id", "00000000-0000-0000-0000-000000000001")
          .maybeSingle();
        if (settingsData && settingsData.settings) {
          const settings = settingsData.settings as any;
          if (settings.leads_to_alunos !== undefined) leadsToAlunos = settings.leads_to_alunos;
          if (settings.auto_clientes_pagarme !== undefined) autoClientes = settings.auto_clientes_pagarme;
        }
      } catch (settingsErr) {
        console.warn("Could not read account_settings:", settingsErr);
      }

      // Associate lists according to the rules
      if (contactId) {
        const { data: allLists } = await supabase
          .from("lists")
          .select("id, name");

        if (allLists && allLists.length > 0) {
          const leadsList = allLists.find((l: any) => l.name === "Leads");
          const alunosList = allLists.find((l: any) => l.name === "Alunos");
          const clientesList = allLists.find((l: any) => l.name === "Clientes");

          // Rule 1: Move from Leads to Alunos
          if (leadsToAlunos) {
            if (alunosList) {
              await supabase
                .from("list_subscriptions")
                .upsert({
                  contact_id: contactId,
                  list_id: alunosList.id,
                  status: "subscribed",
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: "contact_id,list_id"
                });
            }
            if (leadsList) {
              await supabase
                .from("list_subscriptions")
                .update({
                  status: "unsubscribed",
                  updated_at: new Date().toISOString()
                })
                .eq("contact_id", contactId)
                .eq("list_id", leadsList.id);
            }
          }

          // Rule 2: Auto-Add to Clientes list
          if (autoClientes && clientesList) {
            await supabase
              .from("list_subscriptions")
              .upsert({
                contact_id: contactId,
                list_id: clientesList.id,
                status: "subscribed",
                updated_at: new Date().toISOString()
              }, {
                onConflict: "contact_id,list_id"
              });
          }
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
