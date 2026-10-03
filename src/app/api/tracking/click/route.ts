import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("cid") || searchParams.get("c") || searchParams.get("campaign_id");
  const contactId = searchParams.get("uid") || searchParams.get("u") || searchParams.get("contact_id");
  const rawUrl = searchParams.get("url") || searchParams.get("target") || "https://realizzarecursos.com.br";

  const rawEmail = searchParams.get("email");

  let destinationUrl = "https://realizzarecursos.com.br";
  try {
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      destinationUrl = rawUrl;
    } else {
      destinationUrl = Buffer.from(rawUrl, "base64").toString("utf-8");
    }
  } catch (e) {
    destinationUrl = rawUrl;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      let resolvedContactId = contactId;
      let resolvedEmail = rawEmail;

      if (rawEmail && !resolvedContactId) {
        const { data: cData } = await supabase.from("contacts").select("id").ilike("email", rawEmail.trim()).maybeSingle();
        if (cData) resolvedContactId = cData.id;
      }
      if (resolvedContactId && !resolvedEmail) {
        const { data: cData } = await supabase.from("contacts").select("email").eq("id", resolvedContactId).maybeSingle();
        if (cData) resolvedEmail = cData.email;
      }

      // 1. Log click event in inbound_webhook_events (always insert — raw event log)
      await supabase.from("inbound_webhook_events").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        source: "realizzare_tracking",
        event_type: "email.click",
        payload: {
          event: "email.click",
          contact_id: resolvedContactId || null,
          email: resolvedEmail || null,
          campaign_id: campaignId,
          target_url: destinationUrl,
          user_agent: req.headers.get("user-agent") || "unknown",
          ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          timestamp: new Date().toISOString()
        },
        status: "processed",
        processed_at: new Date().toISOString()
      });

      // 2. Recalculate and SET click_count from distinct clickers (idempotent — no race condition)
      // Instead of check-then-increment (racy), we query all events and count distinct emails,
      // then SET the count. Concurrent requests may temporarily set the same value, but the
      // final result is always correct and never inflated.
      if (campaignId) {
        const { data: clickEvents } = await supabase
          .from("inbound_webhook_events")
          .select("payload")
          .eq("event_type", "email.click")
          .filter("payload->>campaign_id", "eq", campaignId);

        const uniqueClickers = new Set<string>();
        for (const row of clickEvents ?? []) {
          const email: string | undefined = (row.payload as Record<string, string> | null)?.email;
          if (email) uniqueClickers.add(email.toLowerCase().trim());
        }
        const distinctClickCount = uniqueClickers.size;

        if (distinctClickCount > 0) {
          await supabase
            .from("campaigns")
            .update({
              click_count: distinctClickCount,
              updated_at: new Date().toISOString()
            })
            .eq("id", campaignId);
        }
      }
    }
  } catch (err) {
    console.error("Click tracking error:", err);
  }

  return NextResponse.redirect(destinationUrl, 302);
}
