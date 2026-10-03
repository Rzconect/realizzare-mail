import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") || "").trim().toLowerCase();
    const supabase = getSupabase();

    // 1. Fetch all lists from DB
    const { data: dbLists, error: listError } = await supabase
      .from("lists")
      .select("id, name, description")
      .order("created_at", { ascending: true });

    if (listError) {
      console.error("Error fetching lists:", listError);
    }

    const lists = dbLists && dbLists.length > 0 ? dbLists : [
      { id: "list-clientes", name: "Clientes", description: "Contatos inscritos através de uma transação." },
      { id: "list-alunos", name: "Alunos", description: "Avisos sobre seus cursos, progresso e emissão de certificados." },
      { id: "list-leads", name: "Leads & Novidades", description: "Lançamentos de cursos gratuitos, materiais e dicas de estudo." },
      { id: "list-professores", name: "Professores & Instrutores", description: "Comunicados acadêmicos e orientações para instrutores." }
    ];

    // 2. Default subscriptions map: all active lists default to true
    const subscriptions: Record<string, boolean> = {};
    lists.forEach((l) => {
      subscriptions[l.id] = true;
    });

    let visibleLists = lists;
    let contact: any = null;

    // 3. If email provided, look up contact and filter to ONLY subscribed lists
    if (email) {
      const { data: contactRecord } = await supabase
        .from("contacts")
        .select("id, email, status, first_name, last_name")
        .ilike("email", email)
        .maybeSingle();

      if (contactRecord) {
        contact = contactRecord;

        const { data: subs } = await supabase
          .from("list_subscriptions")
          .select("list_id, status")
          .eq("contact_id", contactRecord.id)
          .eq("status", "subscribed");

        const subscribedListIds = new Set((subs || []).map((s) => s.list_id));

        // Show strictly the lists the contact is actually subscribed to
        visibleLists = lists.filter((l) => subscribedListIds.has(l.id));

        // Subscriptions state for these lists
        visibleLists.forEach((l) => {
          subscriptions[l.id] = true;
        });
      }
    }

    return NextResponse.json({
      success: true,
      email,
      contact,
      lists: visibleLists,
      subscriptions
    });
  } catch (err: any) {
    console.error("Preferences GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, subscriptions = {} } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "E-mail inválido ou não informado" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabase();

    const isCompletelyUnsubscribed =
      Object.keys(subscriptions).length > 0 &&
      Object.values(subscriptions).every((v) => !v);

    // 1. Find or create contact
    let contactId: string | null = null;
    const { data: existingContact } = await supabase
      .from("contacts")
      .select("id, status")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (existingContact) {
      contactId = existingContact.id;
      const targetStatus = isCompletelyUnsubscribed ? "unsubscribed" : "active";
      if (existingContact.status !== targetStatus) {
        await supabase
          .from("contacts")
          .update({ status: targetStatus, updated_at: new Date().toISOString() })
          .eq("id", contactId);
      }
    } else {
      const { data: newContact, error: createErr } = await supabase
        .from("contacts")
        .insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          email: cleanEmail,
          status: isCompletelyUnsubscribed ? "unsubscribed" : "active",
          source: "preferences_page"
        })
        .select("id")
        .single();

      if (createErr) {
        console.error("Error creating contact on preferences:", createErr);
      }
      contactId = newContact?.id || null;
    }

    // 2. Update list subscriptions if contactId exists
    if (contactId) {
      for (const [listId, isSubscribed] of Object.entries(subscriptions)) {
        if (!listId || listId.startsWith("fallback-")) continue;

        const subStatus = isSubscribed ? "subscribed" : "unsubscribed";

        const { data: existingSub } = await supabase
          .from("list_subscriptions")
          .select("id")
          .eq("contact_id", contactId)
          .eq("list_id", listId)
          .maybeSingle();

        if (existingSub) {
          await supabase
            .from("list_subscriptions")
            .update({ status: subStatus })
            .eq("id", existingSub.id);
        } else {
          await supabase.from("list_subscriptions").insert({
            contact_id: contactId,
            list_id: listId,
            status: subStatus
          });
        }
      }
    }

    // 3. Synchronize with suppression_list
    if (isCompletelyUnsubscribed) {
      const { data: existingSup } = await supabase
        .from("suppression_list")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (!existingSup) {
        await supabase.from("suppression_list").insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          email: cleanEmail,
          reason: "unsubscribe",
          origin: "Página de Preferências (Opt-out)",
          removable: true
        });
      }
    } else {
      // If contact active in at least one list, remove from suppression_list
      await supabase
        .from("suppression_list")
        .delete()
        .eq("email", cleanEmail)
        .eq("reason", "unsubscribe");
    }

    // 4. Record conversion event in reporting_events
    await supabase.from("reporting_events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      contact_email: cleanEmail,
      event_type: "page_conversion",
      metadata: {
        page_id: "page-preferences-01",
        slug: "preferences",
        type: "conversion",
        action: isCompletelyUnsubscribed ? "unsubscribed_all" : "updated_preferences",
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      contactId,
      email: cleanEmail,
      isCompletelyUnsubscribed
    });
  } catch (err: any) {
    console.error("Preferences POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
