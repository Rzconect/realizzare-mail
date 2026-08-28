const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getSecretKey() {
  const { data } = await supabase.from("account_settings").select("settings").eq("org_id", "00000000-0000-0000-0000-000000000001").maybeSingle();
  return data?.settings?.pagarme_secret_key || data?.settings?.pagarmeSecretKey || process.env.PAGARME_SECRET_KEY || "";
}

async function fetchPagarme(endpoint, secretKey) {
  const auth = "Basic " + Buffer.from(secretKey.trim() + ":").toString("base64");
  // Fetch all paid since Aug 1 - API doesn't support created_until so we filter client-side
  const startDate = "2026-08-01T00:00:00-03:00";
  const endDate = new Date("2026-08-23T00:00:00-03:00").getTime(); // exclusive
  let all = [];
  const seenIds = new Set();

  for (let page = 1; page <= 20; page++) {
    const url = `https://api.pagar.me/core/v5/${endpoint}?created_since=${encodeURIComponent(startDate)}&status=paid&page=${page}&size=100`;
    const res = await fetch(url, { headers: { Authorization: auth, "Content-Type": "application/json" } });
    if (!res.ok) { console.log(`[${endpoint}] page ${page} error:`, res.status, await res.text().catch(()=>"")); break; }
    const data = await res.json();
    const items = data?.data || [];
    if (items.length === 0) break;
    let addedThisPage = 0;
    for (const item of items) {
      const itemDate = new Date(item?.created_at || 0).getTime();
      // Filter: only items created before Aug 23 (22/08 end of day BRT = Aug 23 03:00 UTC)
      if (itemDate >= endDate) continue;
      if (item?.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        all.push(item);
        addedThisPage++;
      }
    }
    if (items.length < 100) break;
    // If all items on this page are after our end date, stop
    if (addedThisPage === 0) break;
  }
  return all;
}

async function main() {
  console.log("=== Pagar.me vs Supabase Comparison (01/08 - 22/08/2026) ===\n");

  const secretKey = await getSecretKey();
  if (!secretKey) { console.error("No Pagar.me secret key found!"); return; }

  // 1. Fetch from Pagar.me API
  console.log("Fetching /charges from Pagar.me...");
  const charges = await fetchPagarme("charges", secretKey);
  console.log(`Fetching /orders from Pagar.me...`);
  const orders = await fetchPagarme("orders", secretKey);

  // Build unified Pagar.me list (email, amount, date, id, status)
  const pagarmeMap = new Map(); // key: email|amountCents|date
  const pagarmeItems = [];

  const processItem = (item, source) => {
    const customer = item?.customer || item?.charge?.customer || {};
    const email = (customer?.email || item?.customer_email || item?.email || "").toLowerCase().trim();
    if (!email) return;
    const amountCents = item?.amount || item?.total_amount || item?.charge?.amount || 0;
    const amountReais = (amountCents / 100).toFixed(2);
    const createdAt = item?.created_at || "";
    const date = createdAt.split("T")[0]; // YYYY-MM-DD
    const status = item?.status || "?";
    const id = item?.id || "";
    const itemTitle = item?.items?.[0]?.description || item?.items?.[0]?.name || item?.description || item?.metadata?.course_name || "?";

    pagarmeItems.push({ id, email, amountReais, amountCents, date, status, source, itemTitle, createdAt });
    const key = `${email}|${amountCents}|${date}`;
    if (!pagarmeMap.has(key)) pagarmeMap.set(key, []);
    pagarmeMap.get(key).push({ id, source, status, itemTitle });
  };

  charges.forEach(c => processItem(c, "charge"));
  orders.forEach(o => processItem(o, "order"));

  // Separate paid vs non-paid
  const pagarmePaid = pagarmeItems.filter(i => i.status === "paid");
  const pagarmeNonPaid = pagarmeItems.filter(i => i.status !== "paid");

  console.log(`\nPagar.me: ${charges.length} charges + ${orders.length} orders = ${pagarmeItems.length} total items`);
  console.log(`  Paid: ${pagarmePaid.length} | Non-paid: ${pagarmeNonPaid.length}`);

  if (pagarmeNonPaid.length > 0) {
    console.log("\n--- NON-PAID items (cancelled/refunded/etc) ---");
    pagarmeNonPaid.forEach(i => {
      console.log(`  [${i.status.toUpperCase()}] ${i.email} | R$${i.amountReais} | ${i.date} | ${i.source} | ${i.id}`);
    });
  }

  // 2. Fetch from Supabase
  const startOfAug = "2026-08-01T00:00:00Z";
  const endOfAug = "2026-08-22T23:59:59Z";
  const { data: dbEvents, error: dbErr } = await supabase.from("reporting_events")
    .select("id, contact_email, created_at, metadata")
    .eq("event_type", "purchase")
    .gte("created_at", startOfAug)
    .lte("created_at", endOfAug)
    .order("created_at", { ascending: true });

  if (dbErr) { console.error("DB error:", dbErr); return; }
  const safeDbEvents = dbEvents || [];
  console.log(`\nSupabase: ${safeDbEvents.length} purchase rows in Aug 2026`);

  // Build supabase map
  const dbMap = new Map();
  const dbItems = safeDbEvents.map(e => {
    const amt = Number(e.metadata?.amount || e.amount || 0).toFixed(2);
    const date = new Date(e.created_at).toISOString().split("T")[0];
    const key = `${e.contact_email.toLowerCase()}|${Math.round(Number(amt)*100)}|${date}`;
    if (!dbMap.has(key)) dbMap.set(key, []);
    dbMap.get(key).push({ id: e.id, meta: e.metadata });
    return { email: e.contact_email.toLowerCase(), amountReais: amt, date, dbId: e.id, pagarmeId: e.metadata?.pagarme_id };
  });

  const dbTotal = dbItems.reduce((s, e) => s + Number(e.amountReais), 0);

  // 3. Compare: what's in Pagar.me PAID but NOT in DB
  console.log("\n--- MISSING in Supabase (in Pagar.me paid but NOT in DB) ---");
  let missingCount = 0;
  let missingTotal = 0;
  const insertCandidates = [];

  // Deduplicate Pagar.me paid by email+amount+date (pick charge over order)
  const deduped = new Map();
  for (const i of pagarmePaid) {
    const key = `${i.email}|${Math.round(Number(i.amountReais)*100)}|${i.date}`;
    if (!deduped.has(key)) {
      deduped.set(key, i);
    } else {
      // prefer charge over order
      const existing = deduped.get(key);
      if (i.source === "charge" && existing.source === "order") deduped.set(key, i);
    }
  }

  for (const [key, item] of deduped) {
    if (!dbMap.has(key)) {
      console.log(`  MISSING: ${item.email} | R$${item.amountReais} | ${item.date} | ${item.source}:${item.id} | "${item.itemTitle}"`);
      missingCount++;
      missingTotal += Number(item.amountReais);
      insertCandidates.push(item);
    }
  }
  if (missingCount === 0) console.log("  (none)");

  // 4. Compare: what's in DB but NOT in Pagar.me paid
  console.log("\n--- EXTRA in Supabase (in DB but NOT in Pagar.me paid) ---");
  let extraCount = 0;
  let extraTotal = 0;
  for (const dbItem of dbItems) {
    const key = `${dbItem.email}|${Math.round(Number(dbItem.amountReais)*100)}|${dbItem.date}`;
    if (!deduped.has(key)) {
      console.log(`  EXTRA: ${dbItem.email} | R$${dbItem.amountReais} | ${dbItem.date} | db_id:${dbItem.dbId} | pagarme_id:${dbItem.pagarmeId}`);
      extraCount++;
      extraTotal += Number(dbItem.amountReais);
    }
  }
  if (extraCount === 0) console.log("  (none)");

  // 5. Summary
  const pagarmeTotal = Array.from(deduped.values()).reduce((s, i) => s + Number(i.amountReais), 0);
  console.log("\n=== SUMMARY ===");
  console.log(`Pagar.me PAID unique transactions: ${deduped.size} | Total: R$ ${pagarmeTotal.toFixed(2)}`);
  console.log(`Supabase purchase rows: ${dbItems.length} | Total: R$ ${dbTotal.toFixed(2)}`);
  console.log(`Missing from DB: ${missingCount} items | R$ ${missingTotal.toFixed(2)}`);
  console.log(`Extra in DB: ${extraCount} items | R$ ${extraTotal.toFixed(2)}`);
  console.log(`Difference: R$ ${(pagarmeTotal - dbTotal).toFixed(2)}`);

  if (insertCandidates.length > 0) {
    console.log(`\n=== Inserting ${insertCandidates.length} missing items into Supabase... ===`);
    for (const item of insertCandidates) {
      await supabase.from("reporting_events").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        contact_email: item.email,
        event_type: "purchase",
        created_at: item.createdAt,
        metadata: {
          provider: "pagarme",
          event: "order.paid",
          item_title: item.itemTitle,
          amount: Number(item.amountReais),
          pagarme_id: item.id
        }
      });
      console.log(`  Inserted: ${item.email} | R$${item.amountReais} | ${item.date}`);
    }
    console.log("Done!");
  }
}

main().catch(console.error);


