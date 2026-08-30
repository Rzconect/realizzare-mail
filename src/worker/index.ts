import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// ==========================================
// CONFIGURAÇÕES INICIAIS
// ==========================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// O Service Role Key é obrigatório no Worker para ignorar as regras de segurança (RLS) do Supabase e ler tudo
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuração do Transportador de Email (AWS SES)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'email-smtp.sa-east-1.amazonaws.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

console.log('====================================================');
console.log('👷 WORKER DO REALIZZARE MAIL INICIADO COM SUCESSO! 👷');
console.log('====================================================');

if (!process.env.SMTP_USER) {
  console.log('⚠️ AVISO: Credenciais SMTP não encontradas no .env.local!');
  console.log('⚠️ O Worker rodará em MODO DE TESTE (Dry Run). Nenhum email real será enviado para a AWS.');
} else {
  console.log('✅ Credenciais SMTP encontradas. Os emails serão enviados para a AWS.');
}

console.log('⏰ Aguardando campanhas agendadas... (checando a cada 1 minuto)');
console.log('');

// ==========================================
// TAREFA CRON (Roda a cada 1 minuto)
// ==========================================
cron.schedule('* * * * *', async () => {
  const agora = new Date().toISOString();
  console.log(`[${agora}] Buscando campanhas pendentes...`);

  try {
    // 1. Buscar campanhas agendadas com horário atrasado ou igual a agora
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', agora);

    if (error) {
      console.error('❌ Erro ao consultar banco:', error);
      return;
    }

    if (!campaigns || campaigns.length === 0) {
      return; // Silencioso se não tiver nada
    }

    for (const campaign of campaigns) {
      console.log(`\n🚀 Iniciando disparo da campanha: "${campaign.name}" (ID: ${campaign.id})`);
      
      // 2. Atualizar status para 'sending' para evitar que o cron do próximo minuto pegue ela de novo
      await supabase
        .from('campaigns')
        .update({ status: 'sending', updated_at: new Date().toISOString() })
        .eq('id', campaign.id);
        
      // 3. Resolução dos Destinatários
      let contactsToProcess: any[] = [];
      const targetListStr = campaign.target_list || '';
      if (targetListStr.includes('||IDS||')) {
        const [, idsString] = targetListStr.split('||IDS||');
        const ids = idsString.split(',').map((id: string) => id.trim()).filter((id: string) => id);
        
        // Busca todos os contatos
        const { data: contactsData } = await supabase.from('contacts').select('id, email, first_name, last_name');
          
        if (contactsData) {
           // Busca todas as inscrições em listas
           const { data: subs } = await supabase.from('list_subscriptions').select('contact_id, list_id');
           const contactIdsInLists = (subs || [])
              .filter(sub => ids.includes(sub.list_id))
              .map(sub => sub.contact_id);
              
           contactsToProcess = contactsData.filter(c => ids.includes(c.id) || contactIdsInLists.includes(c.id));
        }
      } else {
        // Fallback: se não usar a nova estrutura, tenta extrair os emails puros
        const rawEmails = targetListStr.split(',')
          .map((e: string) => e.trim())
          .filter((e: string) => e.includes('@'));
        contactsToProcess = rawEmails.map((email: string) => ({ email, first_name: '', last_name: '' }));
      }
      
      // Remover duplicatas
      const uniqueMap = new Map();
      for (const c of contactsToProcess) {
         if (!uniqueMap.has(c.email)) uniqueMap.set(c.email, c);
      }
      const uniqueContacts = Array.from(uniqueMap.values());
      
      console.log(`👥 Total de destinatários únicos: ${uniqueContacts.length}`);
      
      let successCount = 0;
      let errorCount = 0;

      // 4. Loop de Envio
      for (const contact of uniqueContacts) {
        const email = contact.email;
        let htmlContent = campaign.html_content || campaign.content || '';
        let subjectContent = campaign.subject || campaign.name || '';
        
        // Substituição das Tags Dinâmicas
        const firstName = contact.first_name || 'Cliente';
        htmlContent = htmlContent.replace(/{{primeiro_nome}}/g, firstName);
        subjectContent = subjectContent.replace(/{{primeiro_nome}}/g, firstName);

        try {
           if (!process.env.SMTP_USER) {
              // MODO DE TESTE (Dry Run) - Se não houver credencial configurada
              console.log(`   [TESTE] E-mail gerado para: ${email} (Não enviado à AWS)`);
              await new Promise(r => setTimeout(r, 100)); // simula atraso
              successCount++;
           } else {
              // MODO REAL - Envia via AWS SES
              const mailOptions = {
                from: process.env.SMTP_FROM || 'contato@realizzarecursos.com.br',
                to: email,
                subject: subjectContent,
                html: htmlContent,
                headers: {
                  'X-Campaign-ID': campaign.id,
                  'X-Contact-ID': contact.id || email
                }
              };
              
              await transporter.sendMail(mailOptions);
              console.log(`   ✅ Enviado para: ${email}`);
              successCount++;
           }
        } catch (err) {
           console.error(`   ❌ Falha ao enviar para ${email}:`, err);
           errorCount++;
        }
        
        // PAUSA PARA SANDBOX: Aguarda 1100ms (1.1s) entre cada envio 
        // para respeitar o limite de 1 email/segundo da AWS Sandbox.
        await new Promise(r => setTimeout(r, 1100));
      }
      
      // 5. Finalização
      await supabase
        .from('campaigns')
        .update({ 
           status: 'sent', 
           sent_count: successCount,
           updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id);
        
      console.log(`🏁 FIM: Campanha concluída! Sucessos: ${successCount} | Erros: ${errorCount}`);
    }

  } catch (err) {
    console.error('❌ Erro fatal no worker:', err);
  }
});
