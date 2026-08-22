import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function formatName(fullName: string) {
  if (!fullName) return { firstName: "Aluno", lastName: "Realizzare" };
  const parts = fullName.trim().split(/\s+/);
  const titleCaseParts = parts.map(
    (p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
  );
  const firstName = titleCaseParts[0] || "Aluno";
  const lastName = titleCaseParts.slice(1).join(" ") || "";
  return { firstName, lastName };
}
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const createdSince = body?.createdSince;

    // Use admin client to bypass RLS for background sync jobs
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Load secret key from settings DB if not provided in body
    let secretKey = body?.secretKey || process.env.PAGARME_SECRET_KEY || process.env.NEXT_PUBLIC_PAGARME_SECRET_KEY || "";
    if (!secretKey) {
      try {
        const { data: settingsData } = await supabaseAdmin
          .from("account_settings")
          .select("settings")
          .eq("org_id", "00000000-0000-0000-0000-000000000001")
          .maybeSingle();
        if (settingsData && settingsData.settings) {
          const settings = settingsData.settings as any;
          secretKey = settings.pagarme_secret_key || settings.pagarmeSecretKey || "";
        }
      } catch (e) {
        console.warn("Could not load secret key from DB settings:", e);
      }
    }

    let authHeader = "";
    if (secretKey) {
      authHeader = "Basic " + Buffer.from(secretKey.trim() + ":").toString("base64");
    }

    // 1. Calculate Start Date: 30 days ago default if not provided
    let startDateISO = createdSince;
    if (!startDateISO) {
      const thirtyDaysAgoMs = Date.now() - (30 * 24 * 60 * 60 * 1000);
      startDateISO = new Date(thirtyDaysAgoMs).toISOString();
    }

    const startDate = startDateISO;
    console.log(`--> Sincronização incremental do Pagar.me iniciada a partir de ${startDate}...`);

    let allPaidItems: any[] = [];
    const seenIds = new Set<string>();

    if (authHeader) {
      // Fetch /charges
      for (let page = 1; page <= 5; page++) {
        try {
          const url = `https://api.pagar.me/core/v5/charges?created_since=${encodeURIComponent(startDate)}&status=paid&page=${page}&size=100`;
          const pagRes = await fetch(url, {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json"
            }
          });

          if (pagRes.ok) {
            const pagData = await pagRes.json();
            const pageData = pagData?.data || [];
            if (pageData.length === 0) break;
            for (const item of pageData) {
              if (item?.id && !seenIds.has(item.id)) {
                seenIds.add(item.id);
                allPaidItems.push(item);
              }
            }
          } else {
            const errText = await pagRes.text().catch(() => "");
            console.warn(`Pagar.me /charges notice on page ${page}:`, pagRes.status, errText);
            break;
          }
        } catch (e) {
          console.error("Fetch charges error:", e);
          break;
        }
      }

      // Fetch /orders as well (not skipping if charges has items)
      for (let page = 1; page <= 5; page++) {
        try {
          const url = `https://api.pagar.me/core/v5/orders?created_since=${encodeURIComponent(startDate)}&status=paid&page=${page}&size=100`;
          const pagOrdersRes = await fetch(url, {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json"
            }
          });

          if (pagOrdersRes.ok) {
            const pagOrdersData = await pagOrdersRes.json();
            const pageData = pagOrdersData?.data || [];
            if (pageData.length === 0) break;
            for (const item of pageData) {
              if (item?.id && !seenIds.has(item.id)) {
                seenIds.add(item.id);
                allPaidItems.push(item);
              }
            }
          } else {
            const errText = await pagOrdersRes.text().catch(() => "");
            console.warn(`Pagar.me /orders notice on page ${page}:`, pagOrdersRes.status, errText);
            break;
          }
        } catch (e) {
          console.error("Fetch orders error:", e);
          break;
        }
      }
    } else {
      console.warn("Nenhuma chave secreta do Pagar.me foi encontrada.");
    }

    let syncedCount = 0;
    const allEventsToInsert: any[] = [];

    for (const item of allPaidItems) {
      const customer = item?.customer || item?.charge?.customer || item?.last_transaction?.customer || {};
      const rawEmail = customer?.email || item?.customer_email || item?.email || item?.charge?.customer?.email || "";
      const email = rawEmail.toLowerCase().trim();
      const name = customer?.name || item?.name || "Aluno Realizzare";
      const phone = customer?.phones?.mobile_phone?.number ? `(${customer.phones.mobile_phone.area_code || "11"}) ${customer.phones.mobile_phone.number}` : (customer?.phone || "");
      
      const itemTitle = item?.metadata?.course_name || 
                        item?.metadata?.course || 
                        item?.items?.[0]?.description || 
                        item?.items?.[0]?.name || 
                        item?.description || 
                        "Certificado de Conclusão - Realizzare Cursos";
      const amountInCents = item?.amount || item?.total_amount || item?.charge?.amount || 4848;
      const amountInReais = amountInCents / 100;

      if (!email) continue;

      syncedCount++;
      const lowerTitle = itemTitle.toLowerCase();
      let category: "certificado" | "curso" | "assinatura" = "certificado";
      if (lowerTitle.includes("assinatura") || lowerTitle.includes("plano")) category = "assinatura";
      else if (lowerTitle.includes("certificado")) category = "certificado";
      else if (lowerTitle.includes("curso")) category = "curso";

      const createdAtStr = item.created_at || new Date().toISOString();
      const dateObj = new Date(createdAtStr);

      allEventsToInsert.push({
        id: item.id || `pagarme-${Math.random().toString()}`,
        name: `${formatName(name).firstName} ${formatName(name).lastName}`.trim(),
        email: email,
        phone: phone,
        date: dateObj.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        time: dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
        eventLabel: `${itemTitle} - R$ ${amountInReais.toFixed(2)}`,
        itemTitle: itemTitle,
        amount: amountInReais,
        category: category,
        paymentMethod: "Cartão / PIX",
        timestampMs: dateObj.getTime(),
        type: "purchase",
        provider: "pagarme",
        isMock: false
      });
    }



    allEventsToInsert.sort((a, b) => b.timestampMs - a.timestampMs);

    // BATCH INSERT INTO SUPABASE
    if (allEventsToInsert.length > 0) {
      const { data: listData } = await supabaseAdmin.from("lists").select("id").eq("name", "Clientes").single();
      const clientesListId = listData?.id;

      const batchSize = 25;
      for (let i = 0; i < allEventsToInsert.length; i += batchSize) {
        const batch = allEventsToInsert.slice(i, i + batchSize);
        await Promise.all(batch.map(async (evt) => {
          try {
            // Check if reporting event already exists
            const { data: existingEvent } = await supabaseAdmin
              .from("reporting_events")
              .select("id")
              .eq("contact_email", evt.email)
              .eq("event_type", "purchase")
              .eq("metadata->>pagarme_id", evt.id)
              .maybeSingle();

            if (!existingEvent) {
              await supabaseAdmin.from("reporting_events").insert({
                org_id: "00000000-0000-0000-0000-000000000001",
                contact_email: evt.email,
                event_type: "purchase",
                created_at: new Date(evt.timestampMs).toISOString(),
                metadata: {
                  provider: "pagarme",
                  event: "order.paid",
                  item_title: evt.itemTitle,
                  amount: evt.amount,
                  category: evt.category,
                  customer_name: [formatName(evt.name).firstName, formatName(evt.name).lastName].filter(Boolean).join(" "),
                  phone: evt.phone,
                  is_historical_mock: evt.isMock,
                  pagarme_id: evt.id
                }
              });
            }

            // Insert or Update Contacts intelligently
            let contactId;
            const { data: existingC } = await supabaseAdmin.from("contacts").select("id, first_name, last_name, phone").eq("email", evt.email).maybeSingle();
            const { firstName, lastName } = formatName(evt.name);
            if (existingC) {
              contactId = existingC.id;
              const updatePayload: any = {
                status: "active",
                updated_at: new Date().toISOString()
              };
              if (firstName && (!existingC.first_name || existingC.first_name === "Aluno")) updatePayload.first_name = firstName;
              if (lastName && (!existingC.last_name || existingC.last_name === "Realizzare")) updatePayload.last_name = lastName;
              if (evt.phone && !existingC.phone) updatePayload.phone = evt.phone;

              await supabaseAdmin.from("contacts").update(updatePayload).eq("id", existingC.id);
            } else {
              const { data: newC } = await supabaseAdmin.from("contacts").insert({
                org_id: "00000000-0000-0000-0000-000000000001",
                email: evt.email,
                first_name: firstName,
                last_name: lastName,
                phone: evt.phone,
                status: "active",
                source: "Pagar.me Integration",
                created_at: new Date(evt.timestampMs).toISOString()
              }).select("id").single();
              contactId = newC?.id;
            }

            // Insert into Purchases
            if (contactId) {
              // Primary dedup: by Pagar.me SKU
              const { data: existingBySku } = await supabaseAdmin
                .from("purchases")
                .select("id")
                .eq("sku", evt.id)
                .maybeSingle();

              // Secondary dedup: by contact + timestamp window + amount
              // Catches cases where the same purchase was inserted with a different SKU format (e.g., from migration)
              const paidAtMin = new Date(evt.timestampMs);
              paidAtMin.setSeconds(0, 0);
              const paidAtMax = new Date(paidAtMin.getTime() + 60000);
              const { data: existingByTime } = await supabaseAdmin
                .from("purchases")
                .select("id")
                .eq("contact_id", contactId)
                .eq("amount", evt.amount)
                .gte("paid_at", paidAtMin.toISOString())
                .lt("paid_at", paidAtMax.toISOString())
                .maybeSingle();

              if (!existingBySku && !existingByTime) {
                const prodType = evt.category === "assinatura" ? "subscription" : 
                                 evt.category === "curso" ? "course" : "certificate";
                await supabaseAdmin.from("purchases").insert({
                  org_id: "00000000-0000-0000-0000-000000000001",
                  contact_id: contactId,
                  product_type: prodType,
                  product_name: evt.itemTitle,
                  amount: evt.amount,
                  sku: evt.id,
                  status: "paid",
                  paid_at: new Date(evt.timestampMs).toISOString(),
                  created_at: new Date(evt.timestampMs).toISOString()
                });
              }
            }

            // Add to Clientes list
            if (contactId && clientesListId) {
              await supabaseAdmin.from("list_subscriptions").upsert({
                contact_id: contactId,
                list_id: clientesListId,
                status: "subscribed",
                updated_at: new Date().toISOString()
              }, { onConflict: "contact_id,list_id" });
            }
          } catch (e) {
            console.error("Batch insert error:", e);
          }
        }));
      }
    }

    // QUERY FACTUAL DB AGGREGATES FOR THE MONTH
    let dbTotalRevenue = 0;
    let dbTotalCerts = 0;
    let dbTotalSubs = 0;
    
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { data: allMonthEvents } = await supabaseAdmin
        .from("reporting_events")
        .select("metadata")
        .gte("created_at", firstDay);
        
      if (allMonthEvents && allMonthEvents.length > 0) {
        for (const ev of allMonthEvents) {
          const meta = ev.metadata || {};
          dbTotalRevenue += (meta.amount || 0);
          if (meta.category === "certificado") dbTotalCerts++;
          if (meta.category === "assinatura") dbTotalSubs++;
        }
      }
    } catch (e) {
      console.error("Erro consultando agregados do DB:", e);
    }

    return NextResponse.json({
      success: true,
      syncedOrdersCount: syncedCount,
      totalRevenueSynced: dbTotalRevenue,
      totalCertsSynced: dbTotalCerts,
      totalSubsSynced: dbTotalSubs,
      events: allEventsToInsert,
      message: `Sincronização concluída! Métricas calculadas com base nos dados históricos no Supabase.`
    }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na sincronização:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
