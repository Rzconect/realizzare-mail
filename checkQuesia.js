require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase
    .from('reporting_events')
    .select('id, metadata, created_at, event_type')
    .ilike('contact_email', '%quesia.t.rita%');
  
  console.log("Found:", JSON.stringify(data, null, 2));
}
check();
