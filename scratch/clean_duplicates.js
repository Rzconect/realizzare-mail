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

async function purgeDuplicates() {
  const { data: events, error } = await client
    .from("reporting_events")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !events) {
    console.error("Error fetching reporting_events:", error);
    return;
  }

  const seenMap = new Map();
  const deleteIds = [];

  events.forEach((e) => {
    if (e.event_type !== "purchase") return;
    const email = (e.contact_email || "").toLowerCase().trim();
    const amt = Number(e.metadata?.amount || e.amount || 0).toFixed(2);
    
    // Group by email + amount + date (YYYY-MM-DD)
    const dateStr = new Date(e.created_at).toISOString().split("T")[0];
    const key = `${email}_${amt}_${dateStr}`;

    if (seenMap.has(key)) {
      deleteIds.push(e.id);
    } else {
      seenMap.set(key, e.id);
    }
  });

  console.log(`Deleting ${deleteIds.length} duplicate purchase events from reporting_events...`);

  // Delete in batches of 50
  for (let i = 0; i < deleteIds.length; i += 50) {
    const batch = deleteIds.slice(i, i + 50);
    const { error: delErr } = await client.from("reporting_events").delete().in("id", batch);
    if (delErr) {
      console.error(`Error deleting batch ${i}:`, delErr);
    } else {
      console.log(`Deleted batch ${i / 50 + 1}/${Math.ceil(deleteIds.length / 50)}`);
    }
  }

  console.log("SUCCESS! All duplicate purchase events have been removed from Supabase!");
}

purgeDuplicates();
