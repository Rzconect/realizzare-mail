
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: runs, error: runsErr } = await supabase
      .from("flow_runs")
      .select("flow_id")
      .eq("status", "running");

    if (runsErr) throw runsErr;

    const activeContactsByFlow: Record<string, number> = {};
    runs?.forEach(r => {
      activeContactsByFlow[r.flow_id] = (activeContactsByFlow[r.flow_id] || 0) + 1;
    });

    return NextResponse.json({ activeContacts: activeContactsByFlow });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

