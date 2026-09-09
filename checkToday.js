require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const key = 'sk_64aa7a6c7dcc4a27b5e4e1f11f3da054';
const auth = Buffer.from(key + ':').toString('base64');

function fetchOrdersToday() {
  return new Promise((resolve, reject) => {
    const since = encodeURIComponent(new Date('2026-09-08T00:00:00Z').toISOString());
    https.get('https://api.pagar.me/core/v5/orders?status=paid&created_since=' + since + '&page=1&size=10', {
      headers: { 'Authorization': 'Basic ' + auth, 'accept': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const { data, error } = await supabase
    .from('reporting_events')
    .delete()
    .eq('metadata->>pagarme_id', 'or_test123');
  
  if (error) console.log("Error deleting test:", error);
  else console.log("Test Webhook deleted successfully.");

  await supabase.from('purchases').delete().eq('sku', 'or_test123');

  console.log("\\n--- Pagar.me Orders for 08/09 ---");
  const orders = await fetchOrdersToday();
  if (orders.data && orders.data.length > 0) {
    orders.data.forEach(o => {
      console.log(o.id + " | " + o.customer.name + " | " + o.status + " | " + o.created_at);
    });
  } else {
    console.log("No paid orders found on Pagar.me for today (08/09).");
  }
}
run();
