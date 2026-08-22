import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { editId, cloneFromId, campaignData } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. CLONE CAMPAIGN
    if (cloneFromId) {
      const { data: setRes } = await supabase.from("account_settings").select("settings").maybeSingle();
      const defaultName = setRes?.settings?.default_sender_name || "Realizzare Cursos";
      const defaultEmail = setRes?.settings?.default_sender_email || "contato@realizzarecursos.com.br";
      const defaultReply = setRes?.settings?.default_reply_to || "contato@realizzare.com";

      const { data: target, error: targetErr } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", cloneFromId)
        .single();

      if (targetErr || !target) {
        return NextResponse.json({ error: "Campanha de origem não encontrada." }, { status: 404 });
      }

      const clonePayload = {
        org_id: target.org_id || "00000000-0000-0000-0000-000000000001",
        name: `${target.name || "Campanha"} (Cópia)`,
        subject: target.subject || "",
        preview_text: target.preview_text || "",
        from_name: target.from_name || defaultName,
        from_email: target.from_email || defaultEmail,
        reply_to: target.reply_to || defaultReply,
        status: "draft",
        target_list: target.target_list || "Lista Geral",
        html_content: target.html_content || "",
        send_type: target.send_type || "immediate",
        sent_count: 0,
        open_count: 0,
        click_count: 0,
        bounce_count: 0,
        spam_count: 0
      };

      const { data: clonedData, error: cloneErr } = await supabase
        .from("campaigns")
        .insert(clonePayload)
        .select("*")
        .single();

      if (cloneErr) throw cloneErr;
      return NextResponse.json({ success: true, campaign: clonedData });
    }

    // 2. UPDATE EXISTING CAMPAIGN
    if (editId) {
      const { data: updatedData, error: updateErr } = await supabase
        .from("campaigns")
        .update(campaignData)
        .eq("id", editId)
        .select("*")
        .single();

      if (updateErr) {
        // Fallback update without single()
        const { error: updateErr2 } = await supabase
          .from("campaigns")
          .update(campaignData)
          .eq("id", editId);
        if (updateErr2) throw updateErr2;
      }
      return NextResponse.json({ success: true, id: editId, campaign: updatedData });
    }

    // 3. CREATE NEW CAMPAIGN
    const { data: newData, error: insertErr } = await supabase
      .from("campaigns")
      .insert(campaignData)
      .select("*")
      .single();

    if (insertErr) throw insertErr;
    return NextResponse.json({ success: true, id: newData.id, campaign: newData });

  } catch (err: any) {
    console.error("Error in /api/campaigns/save route:", err);
    return NextResponse.json({ error: err.message || "Erro interno ao salvar campanha." }, { status: 500 });
  }
}
