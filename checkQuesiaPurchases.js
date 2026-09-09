require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: contacts } = await supabase.from('contacts').select('id, email').ilike('email', '%quesia.t.rita%');
  const cId = contacts[0].id;

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .eq('contact_id', cId);
  
  console.log("Purchases:", JSON.stringify(purchases, null, 2));
}
check();
