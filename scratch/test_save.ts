
import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
import { createClient } from '@supabase/supabase-js';

async function run() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const campaignData = {
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "Teste de Stepper",
      subject: "Assunto Stepper",
      preview_text: "",
      from_name: "Remetente",
      from_email: "email@email.com",
      reply_to: "email@email.com",
      status: "draft",
      html_content: "",
      target_list: "Nenhuma lista selecionada||IDS||",
      sent_count: 0
    };

    const { data: newData, error: insertErr } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select('*')
      .single();

    if (insertErr) throw insertErr;
    console.log("SUCCESS:", newData);
  } catch (err: any) {
    console.error("ERROR:", err);
  }
}
run();

