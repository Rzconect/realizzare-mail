require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log("Deleting duplicate charges...");
  
  // 1. Delete reporting_events with pagarme_id starting with 'ch_'
  const { data: evts, error: err1 } = await supabase
    .from('reporting_events')
    .delete()
    .like('metadata->>pagarme_id', 'ch_%')
    .select('id');
    
  console.log(`Deleted ${evts?.length || 0} charge reporting_events`, err1 || '');

  // 2. Delete purchases with sku starting with 'ch_'
  const { data: purchs, error: err2 } = await supabase
    .from('purchases')
    .delete()
    .like('sku', 'ch_%')
    .select('id');

  console.log(`Deleted ${purchs?.length || 0} charge purchases`, err2 || '');
}
check();
