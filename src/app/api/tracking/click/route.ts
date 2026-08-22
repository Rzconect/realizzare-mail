import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("cid") || searchParams.get("c") || searchParams.get("campaign_id");
  const contactId = searchParams.get("uid") || searchParams.get("u") || searchParams.get("contact_id");
  const rawUrl = searchParams.get("url") || searchParams.get("target") || "https://realizzarecursos.com.br";

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

      // 1. Update Campaign click_count
      if (campaignId) {
        const { data: camp } = await supabase
          .from("campaigns")
          .select("click_count")
          .eq("id", campaignId)
          .maybeSingle();

        if (camp) {
          await supabase
            .from("campaigns")
            .update({
              click_count: (camp.click_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq("id", campaignId);
        }
      }

      // 2. Log click event in inbound_webhook_events
      if (contactId || campaignId) {
        await supabase.from("inbound_webhook_events").insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          source: "realizzare_tracking",
          event_type: "email.click",
          payload: {
            event: "email.click",
            contact_id: contactId,
            campaign_id: campaignId,
            target_url: destinationUrl,
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
    console.error("Click tracking error:", err);
  }

  return NextResponse.redirect(destinationUrl, 302);
}
