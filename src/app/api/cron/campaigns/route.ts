import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return processScheduledCampaigns(req);
}

export async function POST(req: Request) {
  return processScheduledCampaigns(req);
}

async function processScheduledCampaigns(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();

    // Fetch campaigns that are scheduled and whose scheduled_at has arrived
    const { data: overdueCampaigns, error: fetchErr } = await supabase
      .from("campaigns")
      .select("id, name, scheduled_at, target_list")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (fetchErr) {
      console.error("Error fetching scheduled campaigns:", fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!overdueCampaigns || overdueCampaigns.length === 0) {
      return NextResponse.json({ message: "No overdue scheduled campaigns found.", processed: 0 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://realizzareconect.com.br";
    const results: any[] = [];

    for (const camp of overdueCampaigns) {
      try {
        // Mark as sending to prevent double execution
        await supabase
          .from("campaigns")
          .update({ status: "sending" })
          .eq("id", camp.id);

        // Call the send endpoint
        const sendRes = await fetch(`${appUrl}/api/campaigns/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: camp.id })
        });

        const sendData = await sendRes.json();
        results.push({ id: camp.id, name: camp.name, result: sendData });
      } catch (err: any) {
        console.error(`Failed to process scheduled campaign ${camp.id}:`, err);
        results.push({ id: camp.id, name: camp.name, error: err.message || err });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} scheduled campaigns.`,
      processed: results.length,
      results
    });
  } catch (err: any) {
    console.error("Critical error in scheduled campaigns cron:", err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
