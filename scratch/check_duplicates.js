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

async function checkDuplicates() {
  // Check purchases table for duplicates
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('*')
    .order('contact_id')
    .order('created_at');

  if (error) {
    console.error('Error fetching purchases:', error);
    return;
  }

  console.log(`Total purchases: ${purchases.length}`);

  // Group by contact_id + sku (pagarme_id)
  const groups = {};
  for (const p of purchases) {
    const key = `${p.contact_id}|${p.sku}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  const duplicateGroups = Object.entries(groups).filter(([, rows]) => rows.length > 1);
  console.log(`\nDuplicate groups found: ${duplicateGroups.length}`);

  for (const [key, rows] of duplicateGroups) {
    console.log(`\nKey: ${key}`);
    rows.forEach(r => console.log(`  id=${r.id} sku=${r.sku} amount=${r.amount} created_at=${r.created_at}`));
  }

  // Check reporting_events for duplicates too
  const { data: events, error: evtError } = await supabase
    .from('reporting_events')
    .select('id, contact_email, metadata, created_at')
    .order('contact_email')
    .order('created_at');

  if (evtError) {
    console.error('Error fetching events:', evtError);
    return;
  }

  const evtGroups = {};
  for (const e of events) {
    const pagarmeId = e.metadata?.pagarme_id || e.metadata?.order_id || null;
    if (!pagarmeId) continue;
    const eKey = `${e.contact_email}|${pagarmeId}`;
    if (!evtGroups[eKey]) evtGroups[eKey] = [];
    evtGroups[eKey].push(e);
  }

  const dupEvtGroups = Object.entries(evtGroups).filter(([, rows]) => rows.length > 1);
  console.log(`\nDuplicate reporting_events groups: ${dupEvtGroups.length}`);
  for (const [key, rows] of dupEvtGroups) {
    console.log(`  Key: ${key} (${rows.length} dups)`);
  }
}

checkDuplicates();
