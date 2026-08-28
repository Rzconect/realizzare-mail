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

async function deduplicateAll() {
  // Fetch all reporting_events
  const { data: events, error } = await supabase
    .from('reporting_events')
    .select('id, contact_email, metadata, created_at')
    .order('contact_email')
    .order('created_at');

  if (error) { console.error(error); return; }

  console.log(`Total reporting_events: ${events.length}`);

  // Group by contact_email + created_at timestamp (second-level)
  const groups = {};
  for (const e of events) {
    const ts = new Date(e.created_at).toISOString().substring(0, 16); // minute-level
    const amt = e.metadata?.amount || '0';
    const key = `${e.contact_email}|${ts}|${amt}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }

  const dupGroups = Object.entries(groups).filter(([, rows]) => rows.length > 1);
  console.log(`\nDuplicate reporting_event groups: ${dupGroups.length}`);

  const eventsToDelete = [];
  const purchasesToDelete = [];

  for (const [key, rows] of dupGroups) {
    // Keep the one that has a pagarme_id (most canonical), delete the rest
    const withId = rows.filter(r => r.metadata?.pagarme_id);
    const withoutId = rows.filter(r => !r.metadata?.pagarme_id);

    const toDelete = withId.length > 0 ? withoutId : rows.slice(1);
    console.log(`\nGroup: ${key}`);
    console.log(`  Keeping: ${(withId[0] || rows[0]).id}`);
    toDelete.forEach(r => {
      console.log(`  DELETING event: ${r.id}`);
      eventsToDelete.push(r.id);
    });
  }

  // Find purchases linked to duplicate events (sku = "migrated-<event_id>")
  const { data: allPurchases } = await supabase.from('purchases').select('id, sku');
  for (const p of allPurchases || []) {
    for (const evtId of eventsToDelete) {
      if (p.sku === `migrated-${evtId}`) {
        console.log(`  DELETING purchase: ${p.id} (sku=${p.sku})`);
        purchasesToDelete.push(p.id);
      }
    }
  }

  if (purchasesToDelete.length === 0 && eventsToDelete.length === 0) {
    console.log('\nNo duplicates to clean up!');
    return;
  }

  // Delete duplicate purchases first (FK constraint)
  if (purchasesToDelete.length > 0) {
    const { error: pErr } = await supabase
      .from('purchases')
      .delete()
      .in('id', purchasesToDelete);
    if (pErr) console.error('Error deleting purchases:', pErr);
    else console.log(`\n✓ Deleted ${purchasesToDelete.length} duplicate purchase(s)`);
  }

  // Delete duplicate reporting_events
  if (eventsToDelete.length > 0) {
    const { error: eErr } = await supabase
      .from('reporting_events')
      .delete()
      .in('id', eventsToDelete);
    if (eErr) console.error('Error deleting events:', eErr);
    else console.log(`✓ Deleted ${eventsToDelete.length} duplicate reporting_event(s)`);
  }

  console.log('\nDeduplication complete!');
}

deduplicateAll();
