import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, action, payload } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: "Missing id or action" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Extract table and raw ID
    let table = "";
    let rawId = "";
    
    if (id.startsWith("test-")) {
      table = "reporting_events";
      rawId = id.replace("test-", "");
    } else if (id.startsWith("pend-")) {
      table = "reporting_events";
      rawId = id.replace("pend-", "");
    } else if (id.startsWith("ativ-")) {
      table = "crm_deals"; // Just in case they have a real deals table later
      rawId = id.replace("ativ-", "");
    } else {
      return NextResponse.json({ success: false, error: "Unknown deal ID format" }, { status: 400 });
    }

    if (table === "reporting_events") {
      // Fetch current metadata
      const { data: evt } = await supabase.from("reporting_events").select("metadata").eq("id", rawId).single();
      if (!evt) return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });

      let newMetadata = { ...(evt.metadata || {}) };

      if (action === "archive") {
        newMetadata.crm_archived = true;
      } else if (action === "update") {
        if (payload.columnId) newMetadata.crm_column = payload.columnId;
        if (payload.assignedTo) newMetadata.crm_assigned = payload.assignedTo;
      }

      const { error } = await supabase.from("reporting_events").update({ metadata: newMetadata }).eq("id", rawId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
