
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
    const now = new Date().toISOString();
    const { data: runsToProcess } = await supabase.from("flow_runs").select("id").eq("status", "running").lte("next_execution_at", now);
    if (!runsToProcess || runsToProcess.length === 0) return;
    const ids = runsToProcess.map(r => r.id);
    const { data: runs, error } = await supabase.from("flow_runs").update({ status: "processing" }).in("id", ids).eq("status", "running").select("*, contacts(*)");

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
        if (node.node_type === "trigger" || node.node_type === "delay") {
          // If we are evaluating a trigger or delay here, it means the wait time is over!
          // We just advance to its child.
          const { data: children } = await supabase.from("flow_nodes").select("id").eq("flow_id", run.flow_id).eq("parent_node_id", node.id);
          nextNodeId = children && children.length > 0 ? children[0].id : null;
        } 
        else if (node.node_type === "email") {
          // Send email
          const contact = run.contacts;
          if (contact && contact.email) {
             if (contact.status === 'unsubscribed') {
                await supabase.from("flow_run_logs").insert({ run_id: run.id, node_id: node.id, action_taken: 'E-mail cancelado: contato descadastrado' });
                const { data: children } = await supabase.from("flow_nodes").select("id").eq("flow_id", run.flow_id).eq("parent_node_id", node.id);
                nextNodeId = children && children.length > 0 ? children[0].id : null;
                continue;
             }
             
             // Fetch flow trigger metric
             const { data: flow } = await supabase.from("flows").select("trigger_metric").eq("id", run.flow_id).single();
             const triggerMetric = flow?.trigger_metric || "";
             
             // Fetch latest event payload based on trigger metric
             let eventPayload = {};
             try {
                if (triggerMetric === "Transação Aprovada" || triggerMetric === "Boleto Gerado") {
                    const statusFilter = triggerMetric === "Transação Aprovada" ? "paid" : "pending";
                    const { data: rEvents } = await supabase
                        .from("reporting_events")
                        .select("metadata")
                        .eq("contact_email", contact.email)
                        .eq("event_type", "purchase")
                        .order("created_at", { ascending: false })
                        .limit(20);
                    
                    const match = rEvents?.find(e => e.metadata?.event?.includes(statusFilter) || (statusFilter === "pending" && e.metadata?.event?.includes("created")));
                    if (match) eventPayload = match.metadata;
                } else if (triggerMetric === "Certificado Emitido" || triggerMetric === "Matrícula Realizada" || triggerMetric === "Reprovação na Prova") {
                    let evType = "certificate_issued";
                    if (triggerMetric === "Matrícula Realizada") evType = "started";
                    if (triggerMetric === "Reprovação na Prova") evType = "failed";
                    
                    const { data: cEvents } = await supabase
                        .from("course_events")
                        .select("metadata")
                        .eq("contact_id", contact.id)
                        .eq("event_type", evType)
                        .order("created_at", { ascending: false })
                        .limit(1);
                    if (cEvents && cEvents.length > 0) eventPayload = cEvents[0].metadata;
                } else if (triggerMetric === "Novo Lead Cadastrado") {
                    const { data: cEvents } = await supabase
                        .from("course_events")
                        .select("metadata")
                        .eq("contact_id", contact.id)
                        .eq("event_type", "contact_created")
                        .order("created_at", { ascending: false })
                        .limit(1);
                    if (cEvents && cEvents.length > 0) eventPayload = cEvents[0].metadata;
                }
             } catch(err) {
                 console.error("Error fetching event payload for template", err);
             }
             
             const { data: orgSettings } = await supabase.from('account_settings').select('*').single();
             const companyName = orgSettings?.company_name || 'Realizzare Cursos';
             const companyAddress = orgSettings?.address || orgSettings?.company_address || '';
             const companyCnpj = orgSettings?.cnpj || '';

             // Build tag replacement function
             function applyTemplateTags(htmlHtml, contactData, evPayload, appUrl) {
               let result = htmlHtml;
               const firstName = contactData?.first_name || "Cliente";
               const email = contactData?.email || "";
               
               // Contact tags
               result = result.replace(/\{\{primeiro_nome\}\}/g, firstName);
               result = result.replace(/\{\{nome_completo\}\}/g, `${contactData?.first_name || ""} ${contactData?.last_name || ""}`.trim() || firstName);
               result = result.replace(/\{\{email\}\}/g, email);
               result = result.replace(/\{\{telefone\}\}/g, contactData?.phone || "");
               
               // Unsubscribe / preferences links
               const unsub = `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
               const prefs = `${appUrl}/preferences?email=${encodeURIComponent(email)}`;
               result = result.replace(/\{\{link_descadastro\}\}/g, unsub);
               result = result.replace(/\{\{link_preferencias\}\}/g, prefs);
               
               // Event payload tags
               const payload = evPayload || {};
               Object.entries(payload).forEach(([k, value]) => {
                 const tag = new RegExp(`\{\{evento\.${k}\}\}`, 'g');
                 result = result.replace(tag, String(value ?? ""));
               });
               
               // Inject footer
               const footer = `
               <div style="text-align:center;padding:20px 0 8px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;margin-top:32px;line-height:1.6;font-family:Arial,sans-serif">
                 <p style="margin:0 0 4px">${companyName}${companyCnpj ? ` · CNPJ: ${companyCnpj}` : ''}</p>
                 ${companyAddress ? `<p style="margin:0 0 8px">${companyAddress}</p>` : ''}
                 <p style="margin:0">
                   <a href="${prefs}" style="color:#6366f1;text-decoration:none">Gerenciar Preferências</a>
                   <span style="margin:0 6px;color:#cbd5e1">·</span>
                   <a href="${unsub}" style="color:#94a3b8;text-decoration:none">Descadastrar</a>
                 </p>
               </div>`;
               
               if (result.includes('</body>')) {
                 result = result.replace('</body>', footer + '</body>');
               } else if (!result.toLowerCase().includes('descadastrar') && !result.toLowerCase().includes('unsubscribe')) {
                 result += footer;
               }
               
               return result;
             }
             
             const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://realizzareconect.com.br";
             const emailConfig = node.config || {};
             const html = applyTemplateTags(emailConfig.htmlContent || "", contact, eventPayload, appUrl);
             const subject = applyTemplateTags(emailConfig.subject || "Sem assunto", contact, eventPayload, appUrl);

             
             if (process.env.SMTP_USER) {
               await transporter.sendMail({
                 from: `"Realizzare" <contato@realizzarecursos.com.br>`,
                 to: contact.email,
                 subject,
                 html,
                 headers: {
                   "X-Flow-Id": run.flow_id,
                   "X-Node-Id": node.id,
                   "X-Contact-Id": contact.id
                 }
               });
             }
             // Log the action
             await supabase.from("flow_run_logs").insert({
               run_id: run.id,
               node_id: node.id,
               action_taken: `E-mail enviado: ${subject}`
             });
          }
          const { data: children } = await supabase.from("flow_nodes").select("id").eq("flow_id", run.flow_id).eq("parent_node_id", node.id);
          nextNodeId = children && children.length > 0 ? children[0].id : null;
        }
        else if (node.node_type === "split") {
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
           
           const { data: children } = await supabase.from("flow_nodes").select("id").eq("flow_id", run.flow_id).eq("parent_node_id", node.id).eq("branch_label", branch);
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
        const { data: nextNode } = await supabase.from("flow_nodes").select("node_type, config").eq("flow_id", run.flow_id).eq("id", nextNodeId).single();
        if (nextNode && nextNode.node_type === "delay") {
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
             status: "running",
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

