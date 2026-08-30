
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "email-smtp.sa-east-1.amazonaws.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function processFlows() {
  console.log(`[${new Date().toISOString()}] Executando Motor de Fluxos...`);
  try {
    const { data: runs, error } = await supabase
      .from("flow_runs")
      .select("*, contacts(*)")
      .eq("status", "running")
      .lte("next_execution_at", new Date().toISOString());

    if (error) {
      console.error("Erro ao buscar flow_runs:", error);
      return;
    }

    if (!runs || runs.length === 0) return;

    for (const run of runs) {
      let currentNodeId = run.current_node_id;
      let isRunActive = true;

      while (isRunActive && currentNodeId) {
        // Fetch current node
        const { data: node, error: nodeErr } = await supabase
          .from("flow_nodes")
          .select("*")
          .eq("id", currentNodeId)
          .single();

        if (nodeErr || !node) {
          await supabase.from("flow_runs").update({ status: "completed" }).eq("id", run.id);
          break;
        }

        let nextNodeId = null;
        let futureTime = null;

        // Execute node logic based on type
        if (node.type === "trigger" || node.type === "delay") {
          // If we are evaluating a trigger or delay here, it means the wait time is over!
          // We just advance to its child.
          const { data: children } = await supabase.from("flow_nodes").select("id").eq("parent_node_id", node.id);
          nextNodeId = children && children.length > 0 ? children[0].id : null;
        } 
        else if (node.type === "email") {
          // Send email
          const contact = run.contacts;
          if (contact && contact.email) {
             const emailConfig = node.config || {};
             const html = (emailConfig.htmlContent || "").replace(/{{primeiro_nome}}/g, contact.first_name || "Cliente");
             const subject = (emailConfig.subject || "Sem assunto").replace(/{{primeiro_nome}}/g, contact.first_name || "Cliente");
             
             if (process.env.SMTP_USER) {
               await transporter.sendMail({
                 from: `"Realizzare" <contato@realizzarecursos.com.br>`,
                 to: contact.email,
                 subject,
                 html
               });
             }
             // Log the action
             await supabase.from("flow_run_logs").insert({
               run_id: run.id,
               node_id: node.id,
               action_taken: `E-mail enviado: ${subject}`
             });
          }
          const { data: children } = await supabase.from("flow_nodes").select("id").eq("parent_node_id", node.id);
          nextNodeId = children && children.length > 0 ? children[0].id : null;
        }
        else if (node.type === "split") {
           let branch = "yes";
           
           const config = node.config || {};
           if (config.splitType === "random") {
              const ratio = config.randomRatio !== undefined ? config.randomRatio : 50;
              const rand = Math.random() * 100;
              branch = rand <= ratio ? "yes" : "no";
           } else {
              // Condição por regras ainda será implementada. Por enquanto, se não for random, vai pro SIM.
              branch = "yes";
           }
           
           const { data: children } = await supabase.from("flow_nodes").select("id").eq("parent_node_id", node.id).eq("branch_label", branch);
           nextNodeId = children && children.length > 0 ? children[0].id : null;
           
           await supabase.from("flow_run_logs").insert({
               run_id: run.id,
               node_id: node.id,
               action_taken: `Divisão Condicional: caminho ${branch.toUpperCase()}`
           });
        }
        else if (node.type === "goto") {
           nextNodeId = node.config?.targetId || null;
        }

        // Advance to next node
        if (!nextNodeId) {
           await supabase.from("flow_runs").update({ status: "completed" }).eq("id", run.id);
           break;
        }

        // Fetch next node to see if it is a delay
        const { data: nextNode } = await supabase.from("flow_nodes").select("type, config").eq("id", nextNodeId).single();
        if (nextNode && nextNode.type === "delay") {
           // Calculate future time
           const unit = nextNode.config?.unit || "days";
           const val = parseInt(nextNode.config?.value || "1");
           const d = new Date();
           if (unit === "minutes") d.setMinutes(d.getMinutes() + val);
           else if (unit === "hours") d.setHours(d.getHours() + val);
           else d.setDate(d.getDate() + val);
           
           futureTime = d.toISOString();
           
           // Update run and break
           await supabase.from("flow_runs").update({
             current_node_id: nextNodeId,
             next_execution_at: futureTime,
             updated_at: new Date().toISOString()
           }).eq("id", run.id);
           
           isRunActive = false; // sleep until next execution
        } else {
           // Immediately jump to next node in the same while loop iteration!
           currentNodeId = nextNodeId;
           // Update DB just in case the worker crashes
           await supabase.from("flow_runs").update({
             current_node_id: currentNodeId,
             updated_at: new Date().toISOString()
           }).eq("id", run.id);
        }
      }
    }
  } catch (err) {
    console.error("Erro fatal no Motor de Fluxos:", err);
  }
}

