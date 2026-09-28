import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { runId, contactId, flowId } = await req.json();

    if (!runId && (!contactId || !flowId)) {
      return NextResponse.json({ error: "Parâmetros insuficientes para remover o lead do fluxo." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let targetRunId = runId;
    let targetFlowId = flowId;
    let targetContactId = contactId;

    if (targetRunId) {
      const { data: runData } = await supabase
        .from("flow_runs")
        .select("id, flow_id, contact_id, current_node_id")
        .eq("id", targetRunId)
        .single();

      if (runData) {
        targetFlowId = targetFlowId || runData.flow_id;
        targetContactId = targetContactId || runData.contact_id;
      }
    } else {
      const { data: runData } = await supabase
        .from("flow_runs")
        .select("id, flow_id, contact_id, current_node_id")
        .eq("flow_id", flowId)
        .eq("contact_id", contactId)
        .in("status", ["running", "processing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (runData) {
        targetRunId = runData.id;
      }
    }

    if (!targetRunId) {
      return NextResponse.json({ error: "Nenhuma execução ativa encontrada para este lead no fluxo." }, { status: 404 });
    }

    // Update status in flow_runs
    const { error: updateError } = await supabase
      .from("flow_runs")
      .update({
        status: "cancelled_manually",
        updated_at: new Date().toISOString()
      })
      .eq("id", targetRunId);

    if (updateError) {
      throw updateError;
    }

    // Fetch flow name for log
    let flowName = "Automação";
    if (targetFlowId) {
      const { data: flowData } = await supabase
        .from("flows")
        .select("name")
        .eq("id", targetFlowId)
        .single();
      if (flowData?.name) {
        flowName = flowData.name;
      }
    }

    // Insert log in flow_run_logs
    await supabase.from("flow_run_logs").insert({
      run_id: targetRunId,
      node_id: null,
      action_taken: `Removido da Automação ${flowName}`
    });

    return NextResponse.json({
      success: true,
      message: `Lead removido com sucesso da automação '${flowName}'.`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
