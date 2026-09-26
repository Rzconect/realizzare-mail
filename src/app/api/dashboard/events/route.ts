import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: eventsData, error } = await supabase
      .from("reporting_events")
      .select("*")
      .not("metadata->>item_title", "ilike", "%amplify%")
      .not("metadata->>item_title", "ilike", "%forge%")
      .not("metadata->>item_title", "ilike", "%pentest%")
      .not("metadata->>item_title", "ilike", "%sweep%")
      .not("metadata->>customer_name", "ilike", "%amplify%")
      .not("metadata->>customer_name", "ilike", "%forge%")
      .not("metadata->>customer_name", "ilike", "%pentest%")
      .not("contact_email", "ilike", "%.invalid")
      .not("contact_email", "ilike", "%example.com")
      .not("contact_email", "ilike", "%example.invalid")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    return NextResponse.json({ eventsData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
