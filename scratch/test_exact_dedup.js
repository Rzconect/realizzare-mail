const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local
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

async function testDedup() {
  const { data: events } = await client.from("reporting_events").select("*").order("created_at", { ascending: true });

  if (!events) return;

  const augStart = new Date("2026-08-01T00:00:00Z").getTime();
  const augEnd = new Date("2026-08-22T23:59:59Z").getTime();

  const seenMap = new Map();
  const duplicateIds = [];
  const keepEvents = [];

  events.forEach((e) => {
    if (e.event_type !== "purchase") return;
    const t = new Date(e.created_at).getTime();
    if (t < augStart || t > augEnd) return;

    const email = (e.contact_email || "").toLowerCase().trim();
    const amt = Number(e.metadata?.amount || e.amount || 0).toFixed(2);
    
    // Group by email + amount + date (YYYY-MM-DD)
    const dateStr = new Date(e.created_at).toISOString().split("T")[0];
    const key = `${email}_${amt}_${dateStr}`;

    if (seenMap.has(key)) {
      duplicateIds.push(e.id);
    } else {
      seenMap.set(key, e);
      keepEvents.push(e);
    }
  });

  let sumAll = 0;
  events.forEach((e) => {
    const t = new Date(e.created_at).getTime();
    if (t >= augStart && t <= augEnd && e.event_type === "purchase") {
      sumAll += Number(e.metadata?.amount || e.amount || 0);
    }
  });

  let sumKeep = 0;
  keepEvents.forEach((e) => {
    sumKeep += Number(e.metadata?.amount || e.amount || 0);
  });

  console.log(`August Total raw sum: R$ ${sumAll.toFixed(2)} (${events.filter(e => e.event_type==='purchase' && new Date(e.created_at)>=augStart && new Date(e.created_at)<=augEnd).length} events)`);
  console.log(`August Cleaned sum: R$ ${sumKeep.toFixed(2)} (${keepEvents.length} transactions)`);
  console.log(`Duplicates to remove: ${duplicateIds.length}`);
  console.log(`Pagar.me Target sum: R$ 6.171,48 (175 transactions)`);
}

testDedup();
