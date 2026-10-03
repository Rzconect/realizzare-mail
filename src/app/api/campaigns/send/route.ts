import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, targetEmails } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch campaign details
    const { data: campaign, error: campErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campErr || !campaign) {
      return NextResponse.json({ error: "Campanha não encontrada no banco." }, { status: 404 });
    }

    // Fetch account settings for SMTP credentials and company info
    const { data: accountSet } = await supabase
      .from("account_settings")
      .select("settings")
      .maybeSingle();

    const settings = accountSet?.settings || {};
    const companyName = settings.company_name || settings.razao_social || "Realizzare Cursos";
    const companyAddress = settings.address || settings.endereco || settings.company_address || "";
    const companyCnpj = settings.cnpj || "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://realizzareconect.com.br";
    const smtpHost = settings.smtp_host || process.env.AWS_SMTP_HOST || "4bzm7fef7nbj.fips.wmjb.mail-manager-smtp.amazonaws.com";
    const smtpPort = Number(settings.smtp_port || process.env.AWS_SMTP_PORT || 587);
    const smtpUser = settings.smtp_user || process.env.AWS_SMTP_USER || "inp-llwbbrq5s6pwk5jzmxdfzia5";
    const smtpPass = settings.smtp_pass || process.env.AWS_SMTP_PASS || "YQeP}L6${[cjo86jh=m[I8Kqg=4k_u[4";

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({
        error: "Credenciais SMTP da AWS SES não configuradas. Preencha o Usuário e a Senha SMTP nas Configurações do Sistema."
      }, { status: 400 });
    }

    // Configure Nodemailer Transport
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // Tracking domain / pixel URL (already defined above as appUrl)
    const openTrackingPixel = `<img src="${appUrl}/api/tracking/open?cid=${campaign.id}" width="1" height="1" style="display:none" alt="" />`;

    let processedHtml = campaign.html_content || "";
    if (!processedHtml.includes("/api/tracking/open")) {
      processedHtml += openTrackingPixel;
    }

    // Rewrite links for click tracking
    if (processedHtml && processedHtml.includes("href=")) {
      processedHtml = processedHtml.replace(/href=["'](https?:\/\/[^"']+)["']/gi, (match: string, p1: string) => {
        if (p1.includes("/api/tracking")) return match;
        const trackingUrl = `${appUrl}/api/tracking/click?cid=${campaign.id}&url=${encodeURIComponent(p1)}`;
        return `href="${trackingUrl}"`;
      });
    }

    function injectFooter(html: string, contactEmail: string): string {
      const unsubLink = `${appUrl}/unsubscribe?email=${encodeURIComponent(contactEmail)}`;
      const prefsLink = `${appUrl}/preferences?email=${encodeURIComponent(contactEmail)}`;
      const footer = `
<div style="text-align:center;padding:20px 0 8px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;margin-top:32px;line-height:1.6;font-family:Arial,sans-serif">
  <p style="margin:0 0 4px">${companyName}${companyCnpj ? ` · CNPJ: ${companyCnpj}` : ''}</p>
  ${companyAddress ? `<p style="margin:0 0 8px">${companyAddress}</p>` : ''}
  <p style="margin:0">
    <a href="${prefsLink}" style="color:#6366f1;text-decoration:none">Gerenciar Preferências</a>
    <span style="margin:0 6px;color:#cbd5e1">·</span>
    <a href="${unsubLink}" style="color:#94a3b8;text-decoration:none">Descadastrar</a>
  </p>
</div>`;
      // Replace tag-based links first
      let result = html
        .replace(/{{link_descadastro}}/g, unsubLink)
        .replace(/{{link_preferencias}}/g, prefsLink);
      // Inject footer before closing body or at end
      if (result.includes('</body>')) {
        result = result.replace('</body>', footer + '</body>');
      } else if (!result.toLowerCase().includes('descadastrar') && !result.toLowerCase().includes('unsubscribe')) {
        result += footer;
      }
      return result;
    }

    function personalizeText(text: string, contact: any): string {
      if (!text) return "";
      let personalized = text;
      const firstName = contact?.first_name || "";
      const lastName = contact?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || contact?.email || "";
      const email = contact?.email || "";
      const phone = contact?.phone || "";

      personalized = personalized.replace(/\{\{\s*primeiro_nome\s*\}\}/gi, firstName || "Cliente");
      personalized = personalized.replace(/\{\{\s*nome\s*\}\}/gi, firstName || "Cliente");
      personalized = personalized.replace(/\{\{\s*nome_completo\s*\}\}/gi, fullName || "Cliente");
      personalized = personalized.replace(/\{\{\s*sobrenome\s*\}\}/gi, lastName || "");
      personalized = personalized.replace(/\{\{\s*email\s*\}\}/gi, email);
      personalized = personalized.replace(/\{\{\s*telefone\s*\}\}/gi, phone);

      return personalized;
    }

    let recipients: string[] = targetEmails || [];
    let excludeEmails: string[] = [];

    if (!recipients || recipients.length === 0) {
      const targetListStr = (campaign.target_list || "").trim();

      // 1. Check for ||IDS|| payload in target_list
      if (targetListStr.includes("||IDS||")) {
        const [mainPart, excludePart] = targetListStr.split("||EXCLUDE_IDS||");
        const idsPart = mainPart.split("||IDS||")[1];
        
        const processIds = async (idsString: string, outputArray: string[]) => {
            const rawIds = idsString ? idsString.split(",").filter(Boolean) : [];
            const contactIds = rawIds.filter((id: string) => id.startsWith("contact-")).map((id: string) => id.replace("contact-", ""));
            const listIds = rawIds.filter((id: string) => !id.startsWith("contact-") && !id.startsWith("seg-"));

            if (contactIds.length > 0) {
              const { data: directContacts } = await supabase.from("contacts").select("id, email, status").in("id", contactIds);
              const { data: activeSubs } = await supabase.from("list_subscriptions").select("contact_id").in("contact_id", contactIds).eq("status", "subscribed");
              const activeContactIds = new Set((activeSubs || []).map(s => s.contact_id));
              (directContacts || []).forEach((c: any) => {
                if (c.email && c.status !== "unsubscribed" && activeContactIds.has(c.id)) outputArray.push(c.email.trim().toLowerCase());
              });
            }
            if (listIds.length > 0) {
              const { data: listSubs } = await supabase.from("list_subscriptions").select("contacts(email, status)").in("list_id", listIds).eq("status", "subscribed");
              (listSubs || []).forEach((s: any) => {
                if (s.contacts?.status === "active" && s.contacts?.email) outputArray.push(s.contacts.email.trim().toLowerCase());
              });
            }
        };

        if (idsPart) await processIds(idsPart, recipients);
        if (excludePart) await processIds(excludePart, excludeEmails);
      }

      // 2. Extract explicit email addresses from target_list string (e.g. "👤 Leonardo (leo@outlook.com)")
      if (recipients.length === 0) {
        const emailMatches = targetListStr.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatches && emailMatches.length > 0) {
          recipients = Array.from(new Set(emailMatches.map((e: string) => e.trim().toLowerCase())));
        }
      }

      // 3. Fallback: match list names against Supabase lists table
      if (recipients.length === 0) {
        const cleanListName = targetListStr.split("||IDS||")[0];
        const listNames = cleanListName.split(",").map((s: string) => s.trim().toLowerCase());
        const { data: dbLists } = await supabase.from("lists").select("id, name");
        const matchedListIds = dbLists
          ?.filter((l: any) => listNames.some((n: string) => n === l.name.toLowerCase()))
          .map((l: any) => l.id) || [];

        if (matchedListIds.length > 0) {
          const { data: subs } = await supabase
            .from("list_subscriptions")
            .select("contacts(email, status)")
            .in("list_id", matchedListIds)
            .eq("status", "subscribed");

          if (subs && subs.length > 0) {
            recipients = subs
              .map((s: any) => s.contacts?.status === "active" ? s.contacts?.email : null)
              .filter(Boolean);
          }
        }
      }

      // 4. Fallback to all active contacts ONLY if explicitly specifies "Geral" or "Todos"
      if (recipients.length === 0 && (targetListStr.toLowerCase().includes("geral") || targetListStr.toLowerCase().includes("todos"))) {
        const { data: allActive } = await supabase
          .from("contacts")
          .select("email")
          .eq("status", "active");

        if (allActive && allActive.length > 0) {
          recipients = allActive.map((c: any) => c.email).filter(Boolean);
        }
      }
    }

    // UNIVERSAL RULE: Contato só recebe se estiver numa lista ativa
    if (recipients.length > 0) {
      const { data: validContacts } = await supabase
        .from("contacts")
        .select("email, id")
        .in("email", recipients)
        .neq("status", "unsubscribed");
        
      if (validContacts && validContacts.length > 0) {
        const validContactIds = validContacts.map(c => c.id);
        const { data: activeSubs } = await supabase
          .from("list_subscriptions")
          .select("contact_id")
          .in("contact_id", validContactIds)
          .eq("status", "subscribed");
          
        const activeContactIds = new Set((activeSubs || []).map(s => s.contact_id));
        recipients = validContacts
          .filter(c => activeContactIds.has(c.id))
          .map(c => c.email);
      } else {
        recipients = [];
      }
    }

    // Deduplicate recipients and apply exclude filter
    const excludeSet = new Set(typeof excludeEmails !== "undefined" ? excludeEmails : []);
    recipients = Array.from(new Set(recipients.map((e: string) => e.trim().toLowerCase()))).filter(e => !excludeSet.has(e));

    let successCount = 0;
    const sendErrors: any[] = [];

    for (const email of recipients) {
      try {
        const recipientEmail = email.trim();
        const { data: contact } = await supabase
          .from("contacts")
          .select("*")
          .ilike("email", recipientEmail)
          .maybeSingle();

        const contactId = contact?.id || "";

        // Personalize text tags first
        let personalizedHtml = personalizeText(campaign.html_content || "", contact);
        // Inject footer with company info + unsubscribe links
        personalizedHtml = injectFooter(personalizedHtml, recipientEmail);

        // Inject per-recipient open tracking pixel
        const openTrackingPixel = `<img src="${appUrl}/api/tracking/open?cid=${campaign.id}&uid=${contactId}&email=${encodeURIComponent(recipientEmail)}" width="1" height="1" style="display:none" alt="" />`;
        if (!personalizedHtml.includes("/api/tracking/open")) {
          personalizedHtml += openTrackingPixel;
        } else {
          personalizedHtml = personalizedHtml.replace(
            /\/api\/tracking\/open\?[^"']*/gi,
            `/api/tracking/open?cid=${campaign.id}&uid=${contactId}&email=${encodeURIComponent(recipientEmail)}`
          );
        }

        // Rewrite per-recipient click tracking links
        if (personalizedHtml.includes("href=")) {
          personalizedHtml = personalizedHtml.replace(/href=["'](https?:\/\/[^"']+)["']/gi, (match: string, p1: string) => {
            if (p1.includes("/api/tracking")) return match;
            const trackingUrl = `${appUrl}/api/tracking/click?cid=${campaign.id}&uid=${contactId}&email=${encodeURIComponent(recipientEmail)}&url=${encodeURIComponent(p1)}`;
            return `href="${trackingUrl}"`;
          });
        }

        const personalizedSubject = personalizeText(campaign.subject || "", contact);

        await transporter.sendMail({
          from: `"${campaign.from_name || 'Realizzare Cursos'}" <${campaign.from_email || 'contato@realizzarecursos.com.br'}>`,
          replyTo: campaign.reply_to || 'contato@realizzare.com',
          to: recipientEmail,
          subject: personalizedSubject,
          html: personalizedHtml,
          headers: {
            "X-Campaign-ID": campaign.id,
            "X-Contact-ID": contactId
          }
        });
        successCount++;
        
        // Log delivery event to inbound_webhook_events
        await supabase.from("inbound_webhook_events").insert({
          event_type: "email.delivered",
          payload: {
            email: recipientEmail,
            contact_id: contactId,
            campaign_id: campaign.id,
            timestamp: new Date().toISOString()
          }
        });
      } catch (err: any) {
        console.error(`Failed to send email to ${email}:`, err);
        sendErrors.push({ email, error: err.message });
      }
    }

    // Update campaign status, success count and bounce/rejection count
    await supabase.from("campaigns").update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_count: successCount,
      bounce_count: sendErrors.length
    }).eq("id", campaign.id);

    return NextResponse.json({
      success: true,
      sent_count: successCount,
      bounce_count: sendErrors.length,
      errors: sendErrors
    });
  } catch (err: any) {
    console.error("API send campaign error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
