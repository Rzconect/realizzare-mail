
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { flowId, contactId } = await req.json();

    if (!flowId || !contactId) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the trigger node of the flow
    const { data: nodes, error: nodeError } = await supabase
      .from("flow_nodes")
      .select("id")
      .eq("flow_id", flowId)
      .eq("type", "trigger")
      .limit(1);

    if (nodeError || !nodes || nodes.length === 0) {
      return NextResponse.json({ error: "Fluxo não possui gatilho de entrada válido" }, { status: 400 });
    }

    const triggerNodeId = nodes[0].id;

    // Check if run already exists
    const { data: existing } = await supabase
      .from("flow_runs")
      .select("id")
      .eq("flow_id", flowId)
      .eq("contact_id", contactId)
      .eq("status", "running")
      .single();
      
    if (existing) {
       return NextResponse.json({ error: "Este contato já está rodando neste fluxo!" }, { status: 400 });
    }

    // Insert new flow run starting at the trigger node, executing immediately
    const { data: run, error: insertError } = await supabase
      .from("flow_runs")
      .insert({
        flow_id: flowId,
        contact_id: contactId,
        status: "running",
        current_node_id: triggerNodeId,
        next_execution_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, run });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

