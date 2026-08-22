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

    // Fetch account settings for SMTP credentials
    const { data: accountSet } = await supabase
      .from("account_settings")
      .select("settings")
      .maybeSingle();

    const settings = accountSet?.settings || {};
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

    // Tracking domain / pixel URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://realizzareconect.com.br";
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

    let recipients: string[] = targetEmails || [];
    if (!recipients || recipients.length === 0) {
      const { data: dbContacts } = await supabase.from("contacts").select("email").eq("status", "active");
      if (dbContacts) {
        recipients = dbContacts.map((c: any) => c.email).filter(Boolean);
      }
    }

    let successCount = 0;
    const sendErrors: any[] = [];

    for (const email of recipients) {
      try {
        await transporter.sendMail({
          from: `"${campaign.from_name || 'Realizzare Cursos'}" <${campaign.from_email || 'contato@realizzarecursos.com.br'}>`,
          replyTo: campaign.reply_to || 'contato@realizzare.com',
          to: email,
          subject: campaign.subject,
          html: processedHtml
        });
        successCount++;
      } catch (err: any) {
        console.error(`Failed to send email to ${email}:`, err);
        sendErrors.push({ email, error: err.message });
      }
    }

    // Update campaign status and count
    await supabase.from("campaigns").update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_count: successCount
    }).eq("id", campaign.id);

    return NextResponse.json({
      success: true,
      sent_count: successCount,
      errors: sendErrors
    });
  } catch (err: any) {
    console.error("API send campaign error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
