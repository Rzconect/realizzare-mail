import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, deal } = body;

    if (!action || !deal || !deal.id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const rawId = deal.id.replace("act-", "");

    if (action === "upsert") {
      const { error } = await supabase.from("reporting_events").upsert({
        id: rawId,
        org_id: "00000000-0000-0000-0000-000000000001",
        contact_email: deal.email || "",
        event_type: "crm_activity",
        metadata: deal
      });
      if (error) throw error;
    } else if (action === "delete") {
      const { error } = await supabase.from("reporting_events").delete().eq("id", rawId).eq("event_type", "crm_activity");
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
