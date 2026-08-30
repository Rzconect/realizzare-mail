
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get("nodeId");

    if (!nodeId) {
      return NextResponse.json({ error: "Missing nodeId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: runs, error } = await supabase
      .from("flow_runs")
      .select("id, created_at, status, contacts(id, email, first_name, last_name)")
      .eq("current_node_id", nodeId)
      .eq("status", "running")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const leads = runs?.map(r => {
      const rawC: any = r.contacts;
      const c: any = Array.isArray(rawC) ? (rawC[0] || {}) : (rawC || {});
      const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email?.split("@")[0] || "Desconhecido";
      
      const entryDate = new Date(r.created_at);
      const entryStr = entryDate.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
      
      const hoursAgo = Math.floor((new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60));
      const timeInStep = hoursAgo > 24 ? "Há " + Math.floor(hoursAgo / 24) + " dias" : "Há " + hoursAgo + " horas";
      
      return {
        id: c.id,
        name,
        email: c.email,
        initials: name.substring(0, 2).toUpperCase(),
        entryDate: entryStr,
        timeInStep
      };
    }) || [];

    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

