const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envConfig = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envConfig.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
    env[match[1]] = value;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkBianka() {
  // Find Bianka's contact id
  const { data: contact } = await supabase
    .from('contacts')
    .select('id, email')
    .ilike('email', '%bianka%')
    .maybeSingle();

  console.log('Contact:', contact);

  if (!contact) {
    console.log('Contact not found by email, trying by name...');
    return;
  }

  // Get all purchases for Bianka
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('contact_id', contact.id)
    .order('created_at');

  console.log('\nPurchases:', JSON.stringify(purchases, null, 2));
  console.log('\nPurchase count:', purchases?.length);

  // Check for duplicate skus
  const skus = purchases?.map(p => p.sku);
  const dupSkus = skus?.filter((s, i) => skus.indexOf(s) !== i);
  console.log('\nDuplicate SKUs:', dupSkus);

  // Also check reporting_events for bianka
  const { data: events } = await supabase
    .from('reporting_events')
    .select('id, contact_email, metadata, created_at')
    .ilike('contact_email', '%bianka%')
    .order('created_at');

  console.log('\nReporting events:', JSON.stringify(events?.map(e => ({
    id: e.id,
    pagarme_id: e.metadata?.pagarme_id,
    order_id: e.metadata?.order_id,
    created_at: e.created_at
  })), null, 2));
}

checkBianka();
