require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: alunosList } = await supabase.from('lists').select('id').eq('name', 'Alunos').single();
  const { data: clientesList } = await supabase.from('lists').select('id').eq('name', 'Clientes').single();

  const { data: recentPurchases } = await supabase.from('purchases').select('contact_id').gte('created_at', '2026-09-08T00:00:00Z');
  
  const cIds = [...new Set(recentPurchases.map(p => p.contact_id))];
  
  if (cIds.length > 0 && alunosList) {
    const { error } = await supabase
      .from('list_subscriptions')
      .delete()
      .eq('list_id', alunosList.id)
      .in('contact_id', cIds);
      
    console.log("Deleted recent pagarme buyers from Alunos list:", error || "Success");
  } else {
    console.log("No recent buyers found.");
  }
}
check();
