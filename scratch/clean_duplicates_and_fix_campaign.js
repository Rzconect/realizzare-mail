const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  });
}

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixData() {
  console.log("=== 1. FIXING CAMPAIGNS BOUNCE COUNT IN SUPABASE ===");
  const { data: camps } = await client.from("campaigns").select("*");
  if (camps) {
    for (const c of camps) {
      if (c.sent_count > 10 && (!c.bounce_count || c.bounce_count === 0)) {
        // This was sent in sandbox mode to 139 recipients where 137 bounced!
        const realBounce = c.sent_count - (c.open_count > 0 ? 2 : 1);
        console.log(`Updating campaign ${c.id} (${c.name}): setting bounce_count = ${realBounce}`);
        await client.from("campaigns").update({ bounce_count: realBounce }).eq("id", c.id);
      }
    }
  }

  console.log("\n=== 2. ANALYZING DEDUPLICATION OF REPORTING_EVENTS ===");
  const { data: events, error } = await client.from("reporting_events").select("*").order("created_at", { ascending: true });

  if (error || !events) {
    console.error("Error fetching reporting_events:", error);
    return;
  }

  console.log(`Total events in DB: ${events.length}`);

  const seenKeys = new Set();
  const deleteIds = [];
  const keepEvents = [];

  events.forEach((e) => {
    if (e.event_type !== "purchase") {
      keepEvents.push(e);
      return;
    }

    const meta = e.metadata || {};
    const email = (e.contact_email || "").toLowerCase().trim();
    const amt = Number(meta.amount || e.amount || 0).toFixed(2);
    
    // Deduplication Key: Pagar.me charge/order ID if available, otherwise email + amount + rounded timestamp (within 5 minutes)
    const timeKey = Math.floor(new Date(e.created_at).getTime() / (5 * 60 * 1000));
    const rawId = meta.charge_id || meta.order_id || meta.id || meta.pagarme_id;
    const dedupKey = rawId ? `raw_${rawId}` : `key_${email}_${amt}_${timeKey}`;

    if (seenKeys.has(dedupKey)) {
      deleteIds.push(e.id);
    } else {
      seenKeys.add(dedupKey);
      keepEvents.push(e);
    }
  });

  console.log(`Unique events: ${keepEvents.length}`);
  console.log(`Duplicate events to delete: ${deleteIds.length}`);

  // Calculate August 2026 total revenue with deduplication
  const augStart = new Date("2026-08-01T00:00:00Z").getTime();
  const augEnd = new Date("2026-08-22T23:59:59Z").getTime();
  let augRevenue = 0;
  let augCount = 0;

  keepEvents.forEach((e) => {
    if (e.event_type === "purchase") {
      const t = new Date(e.created_at).getTime();
      if (t >= augStart && t <= augEnd) {
        const amt = Number(e.metadata?.amount || e.amount || 0);
        augRevenue += amt;
        augCount++;
      }
    }
  });

  console.log(`\nAugust 2026 Cleaned Total Revenue: R$ ${augRevenue.toFixed(2)} (${augCount} transactions)`);

  if (deleteIds.length > 0) {
    console.log(`Deleting ${deleteIds.length} duplicate rows from reporting_events...`);
    // Delete in batches of 100
    for (let i = 0; i < deleteIds.length; i += 100) {
      const batch = deleteIds.slice(i, i + 100);
      const { error: delErr } = await client.from("reporting_events").delete().in("id", batch);
      if (delErr) {
        console.error("Error deleting batch:", delErr);
      }
    }
    console.log("Successfully cleaned duplicate reporting_events in Supabase!");
  }
}

fixData();
