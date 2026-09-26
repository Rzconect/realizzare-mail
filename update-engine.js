const fs = require('fs');

let c = fs.readFileSync('src/worker/engine.ts', 'utf8');

const fetchLogic = `          const contact = run.contacts;
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
               result = result.replace(/\\{\\{primeiro_nome\\}\\}/g, firstName);
               result = result.replace(/\\{\\{nome_completo\\}\\}/g, \`\${contactData?.first_name || ""} \${contactData?.last_name || ""}\`.trim() || firstName);
               result = result.replace(/\\{\\{email\\}\\}/g, email);
               result = result.replace(/\\{\\{telefone\\}\\}/g, contactData?.phone || "");
               
               // Unsubscribe / preferences links
               const unsub = \`\${appUrl}/unsubscribe?email=\${encodeURIComponent(email)}\`;
               const prefs = \`\${appUrl}/preferences?email=\${encodeURIComponent(email)}\`;
               result = result.replace(/\\{\\{link_descadastro\\}\\}/g, unsub);
               result = result.replace(/\\{\\{link_preferencias\\}\\}/g, prefs);
               
               // Event payload tags
               const payload = evPayload || {};
               Object.entries(payload).forEach(([k, value]) => {
                 const tag = new RegExp(\`\\{\\{evento\\.\${k}\\}\\}\`, 'g');
                 result = result.replace(tag, String(value ?? ""));
               });
               
               // Inject footer
               const footer = \`
               <div style="text-align:center;padding:20px 0 8px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;margin-top:32px;line-height:1.6;font-family:Arial,sans-serif">
                 <p style="margin:0 0 4px">\${companyName}\${companyCnpj ? \` · CNPJ: \${companyCnpj}\` : ''}</p>
                 \${companyAddress ? \`<p style="margin:0 0 8px">\${companyAddress}</p>\` : ''}
                 <p style="margin:0">
                   <a href="\${prefs}" style="color:#6366f1;text-decoration:none">Gerenciar Preferências</a>
                   <span style="margin:0 6px;color:#cbd5e1">·</span>
                   <a href="\${unsub}" style="color:#94a3b8;text-decoration:none">Descadastrar</a>
                 </p>
               </div>\`;
               
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
`;

const oldLogic = `          const contact = run.contacts;
          if (contact && contact.email) {
             const emailConfig = node.config || {};
             const html = (emailConfig.htmlContent || "").replace(/{{primeiro_nome}}/g, contact.first_name || "Cliente");
             const subject = (emailConfig.subject || "Sem assunto").replace(/{{primeiro_nome}}/g, contact.first_name || "Cliente");`;

c = c.replace(oldLogic, fetchLogic);
fs.writeFileSync('src/worker/engine.ts', c);
console.log('done!');
