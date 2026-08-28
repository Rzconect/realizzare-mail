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

async function inspectMariana() {
  const email = 'mariana.siqueira@realizzare.com.br';
  
  // 1. Contact
  const { data: contacts, error: cErr } = await supabase.from('contacts').select('*').eq('email', email);
  console.log('--- CONTACTS ---', contacts, cErr);

  if (contacts && contacts.length > 0) {
    const contactId = contacts[0].id;

    // 2. Enrollments
    const { data: enrollments, error: eErr } = await supabase.from('enrollments').select('*, courses(*)').eq('contact_id', contactId);
    console.log('--- ENROLLMENTS ---', enrollments, eErr);

    // 3. Course Events
    const { data: courseEvents, error: ceErr } = await supabase.from('course_events').select('*').eq('contact_id', contactId);
    console.log('--- COURSE EVENTS ---', courseEvents, ceErr);

    // 4. Inbound Webhook Events
    const { data: webhooks, error: wErr } = await supabase.from('inbound_webhook_events').select('*');
    console.log('--- INBOUND WEBHOOK EVENTS COUNT ---', webhooks ? webhooks.length : 0, wErr);
  }
}

inspectMariana();
