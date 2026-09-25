const fs = require('fs');
let c = fs.readFileSync('src/app/api/v1/realizzare-events/route.ts', 'utf8');

const helper = `async function triggerFlowsForEvent(supabase: any, eventName: string, contactId: string) {
  try {
    const { data: flows, error: flowsErr } = await supabase
      .from("flows")
      .select("id")
      .eq("status", "active")
      .eq("trigger_metric", eventName);
      
    if (flowsErr || !flows || flows.length === 0) return;

    for (const flow of flows) {
      const { data: triggerNodes } = await supabase
        .from("flow_nodes")
        .select("id")
        .eq("flow_id", flow.id)
        .eq("node_type", "trigger")
        .limit(1);
        
      if (!triggerNodes || triggerNodes.length === 0) continue;
      
      const { data: existing } = await supabase
        .from("flow_runs")
        .select("id")
        .eq("flow_id", flow.id)
        .eq("contact_id", contactId)
        .eq("status", "running")
        .single();
      
      if (existing) continue;

      await supabase
        .from("flow_runs")
        .insert({
          flow_id: flow.id,
          contact_id: contactId,
          status: "running",
          current_node_id: triggerNodes[0].id,
          next_execution_at: new Date().toISOString()
        });
    }
  } catch (e) {
    console.error("Error triggering flows:", e);
  }
}

`;

c = c.replace('export async function POST', helper + 'export async function POST');

c = c.replace('processedResult = { action: "contact_upserted"', 'await triggerFlowsForEvent(supabase, "Contato Criado / Atualizado", contact.id);\n      processedResult = { action: "contact_upserted"');

c = c.replace('processedResult = { action: "enrollment_created"', 'await triggerFlowsForEvent(supabase, "Matrícula Realizada", contact.id);\n      processedResult = { action: "enrollment_created"');

fs.writeFileSync('src/app/api/v1/realizzare-events/route.ts', c);
console.log('Injected triggerFlowsForEvent in realizare-events');
