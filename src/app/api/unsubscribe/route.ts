import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");

    let body: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        body = await req.json();
      } catch (e) {}
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      try {
        const text = await req.text();
        const params = new URLSearchParams(text);
        body = Object.fromEntries(params.entries());
      } catch (e) {}
    }

    const email = (body.email || queryEmail || "").trim().toLowerCase();
    const action = body.action || "unsubscribe";
    const reason = body.reason || "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "E-mail inválido ou não informado" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    if (action === "unsubscribe") {
      // 1. Update contact status
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

      if (contact?.id) {
        await supabase
          .from("contacts")
          .update({ status: "unsubscribed", updated_at: new Date().toISOString() })
          .eq("id", contact.id);

        await supabase
          .from("list_subscriptions")
          .update({ status: "unsubscribed" })
          .eq("contact_id", contact.id);
      }

      // 2. Add to platform suppression_list
      const { data: existingSup } = await supabase
        .from("suppression_list")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (!existingSup) {
        await supabase.from("suppression_list").insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          email: email,
          reason: "unsubscribe",
          origin: "Opt-out / Link de Descadastro",
          removable: true
        });
      }

      // 3. Record tracking conversion
      await supabase.from("reporting_events").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        contact_email: email,
        event_type: "page_conversion",
        metadata: {
          page_id: "page-unsubscribe-02",
          slug: "unsubscribe",
          type: "conversion",
          action: "unsubscribe",
          reason: reason || "direct_click",
          timestamp: new Date().toISOString()
        }
      });

      return NextResponse.json({
        success: true,
        action: "unsubscribed",
        email
      });
    }

    if (action === "resubscribe") {
      // 1. Update contact status back to active
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

      if (contact?.id) {
        await supabase
          .from("contacts")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("id", contact.id);

        await supabase
          .from("list_subscriptions")
          .update({ status: "subscribed" })
          .eq("contact_id", contact.id);
      }

      // 2. Remove from suppression_list if reason was unsubscribe
      await supabase
        .from("suppression_list")
        .delete()
        .eq("email", email)
        .eq("reason", "unsubscribe");

      // 3. Record re-subscription event
      await supabase.from("reporting_events").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        contact_email: email,
        event_type: "page_conversion",
        metadata: {
          page_id: "page-unsubscribe-02",
          slug: "unsubscribe",
          type: "conversion",
          action: "resubscribe",
          timestamp: new Date().toISOString()
        }
      });

      return NextResponse.json({
        success: true,
        action: "resubscribed",
        email
      });
    }

    return NextResponse.json({ success: false, error: "Ação inválida" }, { status: 400 });
  } catch (err: any) {
    console.error("Unsubscribe API error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
