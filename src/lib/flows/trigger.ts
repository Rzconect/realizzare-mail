import { createClient } from "@supabase/supabase-js";

export async function triggerFlowsForEvent(supabase: any, eventName: string, contactId: string, payload: any = {}) {
  const evaluateTriggerRule = (config: any, triggerType: string, payload: any) => {
    let rule = config?.rule;
    let operator = config?.operator;
    let value = config?.value;

    // If the trigger node config has the rule explicitly set, use it directly
    if (rule && rule !== "Nenhuma regra extra" && rule !== "Nenhuma Regra Adicional") {
      // Already set from node config — fall through to evaluation below
    } else if (triggerType && triggerType.includes("Regras: ")) {
      // Parse from trigger_type string
      const rulePart = triggerType.split("Regras: ")[1].trim();
      if (rulePart && rulePart !== "Nenhuma regra extra" && rulePart !== "Disparador não configurado") {
        // New format: "Regras: [Diferente de] NR 10" or "Regras: [É igual a] NR 10"
        const bracketMatch = rulePart.match(/^\[([^\]]+)\]\s*(.+)$/);
        if (bracketMatch) {
          operator = bracketMatch[1].trim();
          value = bracketMatch[2].trim();
          rule = "Nome do Curso específico";
        } else {
          // Legacy format: "Regras: NR 10" or "Regras: Igual a NR 10"
          const operatorsOld = ["Igual a", "Não é igual a", "Contém", "Não contém", "Maior que (Valor/Data)", "Menor que (Valor/Data)"];
          let matchedOldOp = false;
          for (const op of operatorsOld) {
            if (rulePart.startsWith(op + " ")) {
              rule = "Nome do Curso específico";
              operator = op === "Igual a" ? "É igual a" : op;
              value = rulePart.replace(op + " ", "");
              matchedOldOp = true;
              break;
            }
          }
          if (!matchedOldOp) {
            rule = "Nome do Curso específico";
            operator = "É igual a";
            value = rulePart;
          }
        }
      }
    }

    if (!rule || rule === "Nenhuma regra extra" || rule === "Nenhuma Regra Adicional") return true;

    if (rule === "Nome do Curso específico" && payload.course_name) {
      const payloadVal = (payload.course_name || "").toLowerCase().trim();
      // value can be an array (from node config) or a string (from trigger_type parsing)
      const condValues = Array.isArray(value) ? value : [value];
      const condList = condValues.flatMap((v: string) => String(v).split(",").map((s: string) => s.trim().toLowerCase())).filter(Boolean);

      if (operator === "É igual a" || operator === "Igual a") {
        return condList.some((c: string) => payloadVal === c);
      }
      if (operator === "Diferente de" || operator === "Não é igual a") {
        return !condList.some((c: string) => payloadVal === c);
      }
      if (operator === "Contém") {
        return condList.some((c: string) => payloadVal.includes(c));
      }
      if (operator === "Não contém") {
        return !condList.some((c: string) => payloadVal.includes(c));
      }
    }

    return true; // Fallback: allow to trigger if rule unknown
  };
  try {
    const { data: flows, error: flowsErr } = await supabase
      .from("flows")
      .select("id, trigger_type")
      .eq("status", "active")
      .eq("trigger_metric", eventName);
      
    if (flowsErr || !flows || flows.length === 0) return;

    for (const flow of flows) {
      // Find the trigger node, OR the first node (parent_node_id = 'trigger' or null)
      let startNodeId = null;
      
      const { data: triggerNodes } = await supabase
        .from("flow_nodes")
        .select("id, config")
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

      // Evaluate trigger rule
      let config = {};
      if (triggerNodes && triggerNodes.length > 0) {
        config = triggerNodes[0].config || {};
      }
      const shouldTrigger = evaluateTriggerRule(config, flow.trigger_type, payload);
      if (!shouldTrigger) {
        continue;
      }
      
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
