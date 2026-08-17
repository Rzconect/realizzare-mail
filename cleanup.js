const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgjxhktboboqekzwwcmq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnanhoa3Rib2JvcWVrend3Y21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUwODA3OCwiZXhwIjoyMDk5MDg0MDc4fQ.U9NQJde2qFXBY4cZBXjipf8ifHE0w1P3jgJ1d7P0JRM');

async function run() {
  const { data, error } = await supabase.from('reporting_events').delete().eq('metadata->>is_historical_mock', 'true');
  console.log('Deleted mock events', data, error);
  
  const { data: cData, error: cErr } = await supabase.from('contacts').delete().like('email', 'aluno%@%');
  console.log('Deleted mock contacts', cData, cErr);
}
run();
