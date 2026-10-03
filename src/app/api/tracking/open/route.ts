import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 1x1 transparent GIF buffer
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("cid") || searchParams.get("c") || searchParams.get("campaign_id");
  const contactId = searchParams.get("uid") || searchParams.get("u") || searchParams.get("contact_id");

  const rawEmail = searchParams.get("email");

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

      // 1. Log event in inbound_webhook_events (always insert — raw event log)
      await supabase.from("inbound_webhook_events").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        source: "realizzare_tracking",
        event_type: "email.open",
        payload: {
          event: "email.open",
          contact_id: resolvedContactId || null,
          email: resolvedEmail || null,
          campaign_id: campaignId,
          user_agent: req.headers.get("user-agent") || "unknown",
          ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          timestamp: new Date().toISOString()
        },
        status: "processed",
        processed_at: new Date().toISOString()
      });

      // 2. Recalculate and SET open_count from distinct openers (idempotent — no race condition)
      // Instead of check-then-increment (racy), we query all events and count distinct emails,
      // then SET the count. Concurrent requests may temporarily set the same value, but the
      // final result is always correct and never inflated.
      if (campaignId) {
        const { data: openEvents } = await supabase
          .from("inbound_webhook_events")
          .select("payload")
          .eq("event_type", "email.open")
          .filter("payload->>campaign_id", "eq", campaignId);

        const uniqueOpeners = new Set<string>();
        for (const row of openEvents ?? []) {
          const email: string | undefined = (row.payload as Record<string, string> | null)?.email;
          if (email) uniqueOpeners.add(email.toLowerCase().trim());
        }
        const distinctOpenCount = uniqueOpeners.size;

        if (distinctOpenCount > 0) {
          await supabase
            .from("campaigns")
            .update({
              open_count: distinctOpenCount,
              updated_at: new Date().toISOString()
            })
            .eq("id", campaignId);
        }
      }
    }
  } catch (err) {
    console.error("Open tracking error:", err);
  }

  // Return 1x1 transparent GIF image response with anti-cache headers
  return new NextResponse(TRANSPARENT_GIF_BUFFER, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}
