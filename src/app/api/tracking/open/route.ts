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

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Update Campaign open_count
      if (campaignId) {
        const { data: camp } = await supabase
          .from("campaigns")
          .select("open_count")
          .eq("id", campaignId)
          .maybeSingle();

        if (camp) {
          await supabase
            .from("campaigns")
            .update({
              open_count: (camp.open_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq("id", campaignId);
        }
      }

      // 2. Log event in inbound_webhook_events for contact timeline
      if (contactId || campaignId) {
        await supabase.from("inbound_webhook_events").insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          source: "realizzare_tracking",
          event_type: "email.open",
          payload: {
            event: "email.open",
            contact_id: contactId,
            campaign_id: campaignId,
            user_agent: req.headers.get("user-agent") || "unknown",
            ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            timestamp: new Date().toISOString()
          },
          status: "processed",
          processed_at: new Date().toISOString()
        });
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
