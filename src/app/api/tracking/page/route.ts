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
    const body = await req.json();
    const { pageId, slug, type = "view", email = "", metadata = {} } = body;

    if (!pageId && !slug) {
      return NextResponse.json({ success: false, error: "Missing pageId or slug" }, { status: 400 });
    }

    const supabase = getSupabase();
    const eventType = type === "conversion" ? "page_conversion" : "page_view";

    // 1. Record individual tracking event
    await supabase.from("reporting_events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      contact_email: email,
      event_type: eventType,
      metadata: {
        page_id: pageId,
        slug: slug,
        type: type,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });

    // 2. If pageId provided, update the page record counters
    if (pageId) {
      const rawUuid = pageId.includes("-") && pageId.length === 36
        ? pageId
        : `00000000-0000-0000-0000-${pageId.replace(/[^a-zA-Z0-9]/g, "").padStart(12, "0").slice(0, 12)}`;

      const { data: pageRecord } = await supabase
        .from("reporting_events")
        .select("*")
        .eq("id", rawUuid)
        .eq("event_type", "page_item")
        .maybeSingle();

      if (pageRecord && pageRecord.metadata) {
        const meta = { ...pageRecord.metadata };
        if (type === "view") {
          meta.views = (meta.views || 0) + 1;
        } else if (type === "conversion") {
          meta.conversions = (meta.conversions || 0) + 1;
        }
        meta.conversionRate = meta.views > 0
          ? Number(((meta.conversions || 0) / meta.views * 100).toFixed(1))
          : 0;

        await supabase.from("reporting_events").update({
          metadata: meta
        }).eq("id", rawUuid);
      }
    }

    return NextResponse.json({ success: true, recorded: eventType });
  } catch (err: any) {
    console.error("Page tracking error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
