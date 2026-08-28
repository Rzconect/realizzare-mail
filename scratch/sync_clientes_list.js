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

async function syncClientesList() {
  const orgId = "00000000-0000-0000-0000-000000000001";
  
  // Get or create "Clientes" list
  let { data: clientesList } = await supabase.from('lists').select('id').eq('name', 'Clientes').maybeSingle();
  if (!clientesList) {
    console.log('Creating Clientes list...');
    const { data: newList } = await supabase.from('lists').insert({
      org_id: orgId,
      name: 'Clientes',
      description: 'Contatos com transações Pagar.me'
    }).select('id').single();
    clientesList = newList;
  }

  console.log('Clientes list ID:', clientesList.id);

  // Find all contacts who have purchases or reporting_events
  const { data: purchases } = await supabase.from('purchases').select('contact_id');
  const { data: events } = await supabase.from('reporting_events').select('contact_email');

  const contactIdsToSubscribe = new Set();

  for (const p of purchases || []) {
    if (p.contact_id) contactIdsToSubscribe.add(p.contact_id);
  }

  if (events && events.length > 0) {
    const emails = events.map(e => e.contact_email?.toLowerCase().trim()).filter(Boolean);
    if (emails.length > 0) {
      const { data: matchedContacts } = await supabase.from('contacts').select('id').in('email', emails);
      for (const mc of matchedContacts || []) {
        contactIdsToSubscribe.add(mc.id);
      }
    }
  }

  console.log(`Found ${contactIdsToSubscribe.size} unique contacts with transactions.`);

  let count = 0;
  for (const cid of contactIdsToSubscribe) {
    const { error } = await supabase.from('list_subscriptions').upsert({
      contact_id: cid,
      list_id: clientesList.id,
      status: 'subscribed',
      updated_at: new Date().toISOString()
    }, { onConflict: 'contact_id,list_id' });
    if (!error) count++;
  }

  console.log(`Successfully subscribed ${count} contacts to Clientes list.`);
}

syncClientesList();
