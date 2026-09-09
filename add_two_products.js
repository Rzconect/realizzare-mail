const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgjxhktboboqekzwwcmq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnanhoa3Rib2JvcWVrend3Y21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUwODA3OCwiZXhwIjoyMDk5MDg0MDc4fQ.U9NQJde2qFXBY4cZBXjipf8ifHE0w1P3jgJ1d7P0JRM');

async function main() {
  const { data, error } = await supabase.from('account_settings').select('settings').eq('org_id', '00000000-0000-0000-0000-000000000001').single();
  const currentSettings = data?.settings || {};
  const currentMapping = currentSettings.pagarme_product_mapping || {};
  
  // Add new mappings
  const newMapping = { 
    ...currentMapping, 
    "2": "Certificado Digital + Impresso",
    "3": "Assinatura Mensal"
  };
  
  currentSettings.pagarme_product_mapping = newMapping;
  await supabase.from('account_settings').update({ settings: currentSettings }).eq('org_id', '00000000-0000-0000-0000-000000000001');
  console.log('Added 2 new products. Total: ' + Object.keys(newMapping).length);
}
main();
