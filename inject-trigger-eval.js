const fs = require('fs');
let c = fs.readFileSync('src/lib/flows/trigger.ts', 'utf8');

const regexFunc = /export async function triggerFlowsForEvent\(supabase: any, eventName: string, contactId: string\) \{/;
c = c.replace(regexFunc, 'export async function triggerFlowsForEvent(supabase: any, eventName: string, contactId: string, payload: any = {}) {\n' +
`  const evaluateTriggerRule = (config: any, triggerType: string, payload: any) => {
    let rule = config?.rule;
    let operator = config?.operator;
    let value = config?.value;

    if (!rule && triggerType && triggerType.includes("Regras: ")) {
      const rulePart = triggerType.split("Regras: ")[1].trim();
      if (rulePart && rulePart !== "Nenhuma regra extra" && rulePart !== "Disparador não configurado") {
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

    if (!rule || rule === "Nenhuma regra extra" || rule === "Nenhuma Regra Adicional") return true;

    if (rule === "Nome do Curso específico" && payload.course_name) {
      const payloadVal = (payload.course_name || "").toLowerCase().trim();
      const condVal = (value || "").toLowerCase().trim();
      
      // condVal could be a comma separated list
      const condList = condVal.split(",").map((v: string) => v.trim());

      if (operator === "É igual a") {
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
  };`);

// Add trigger_type to flows select
c = c.replace('.select("id")', '.select("id, trigger_type")');

// Add rule evaluation around startNodeId assignment
const insertLogicStr = `      if (!startNodeId) continue;
      
      const { data: existing }`;

const evaluateLogicStr = `      if (!startNodeId) continue;

      // Evaluate trigger rule
      let config = {};
      if (triggerNodes && triggerNodes.length > 0) {
        config = triggerNodes[0].config || {};
      }
      const shouldTrigger = evaluateTriggerRule(config, flow.trigger_type, payload);
      if (!shouldTrigger) {
        continue;
      }
      
      const { data: existing }`;

c = c.replace(insertLogicStr, evaluateLogicStr);

// I need to fetch config in flow_nodes select
c = c.replace('.select("id")\n        .eq("flow_id", flow.id)\n        .eq("node_type", "trigger")', '.select("id, config")\n        .eq("flow_id", flow.id)\n        .eq("node_type", "trigger")');

fs.writeFileSync('src/lib/flows/trigger.ts', c);
console.log('Modified trigger logic to evaluate rules');
