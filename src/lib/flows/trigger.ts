import { createClient } from "@supabase/supabase-js";

export async function triggerFlowsForEvent(supabase: any, eventName: string, contactId: string) {
  try {
    const { data: flows, error: flowsErr } = await supabase
      .from("flows")
      .select("id")
      .eq("status", "active")
      .eq("trigger_metric", eventName);
      
    if (flowsErr || !flows || flows.length === 0) return;

    for (const flow of flows) {
      // Find the trigger node, OR the first node (parent_node_id = 'trigger' or null)
      let startNodeId = null;
      
      const { data: triggerNodes } = await supabase
        .from("flow_nodes")
        .select("id")
        .eq("flow_id", flow.id)
        .eq("node_type", "trigger")
        .limit(1);
        
      if (triggerNodes && triggerNodes.length > 0) {
        startNodeId = triggerNodes[0].id;
      } else {
        const { data: firstNodes } = await supabase
          .from("flow_nodes")
          .select("id")
          .eq("flow_id", flow.id)
          .eq("parent_node_id", "trigger")
          .limit(1);
          
        if (firstNodes && firstNodes.length > 0) {
          startNodeId = firstNodes[0].id;
        } else {
           const { data: veryFirstNodes } = await supabase
            .from("flow_nodes")
            .select("id")
            .eq("flow_id", flow.id)
            .is("parent_node_id", null)
            .limit(1);
            if (veryFirstNodes && veryFirstNodes.length > 0) {
              startNodeId = veryFirstNodes[0].id;
            }
        }
      }
        
      if (!startNodeId) continue;
      
      const { data: existing } = await supabase
        .from("flow_runs")
        .select("id")
        .eq("flow_id", flow.id)
        .eq("contact_id", contactId)
        .eq("status", "running")
        .single();
      
      // se já está rodando, pula
      if (existing) continue;

      await supabase
        .from("flow_runs")
        .insert({
          flow_id: flow.id,
          contact_id: contactId,
          status: "running",
          current_node_id: startNodeId,
          next_execution_at: new Date().toISOString()
        });
    }
  } catch (e) {
    console.error("Error triggering flows:", e);
  }
}
