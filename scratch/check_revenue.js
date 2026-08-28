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

async function checkRevenue() {
  const { data: events, error } = await client
    .from("reporting_events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reporting_events:", error);
    return;
  }

  console.log(`Total reporting_events count: ${events.length}`);

  // Check sum for August 2026 (01/08/2026 - 22/08/2026)
  const augStart = new Date("2026-08-01T00:00:00Z").getTime();
  const augEnd = new Date("2026-08-22T23:59:59Z").getTime();

  let augSum = 0;
  let augCount = 0;

  const eventTypeMap = {};
  const ordersSeen = new Set();
  let duplicateCount = 0;
  let duplicateSum = 0;

  events.forEach((e) => {
    const t = new Date(e.created_at).getTime();
    eventTypeMap[e.event_type] = (eventTypeMap[e.event_type] || 0) + 1;

    if (t >= augStart && t <= augEnd) {
      if (e.event_type === "purchase") {
        const amt = Number(e.metadata?.amount || e.amount || 0);
        const orderId = e.metadata?.order_id || e.metadata?.id || e.id;
        
        if (ordersSeen.has(orderId)) {
          duplicateCount++;
          duplicateSum += amt;
        } else {
          ordersSeen.add(orderId);
        }

        augSum += amt;
        augCount++;
        console.log(`[AUG EVENT] ${e.created_at} | ${e.contact_email} | R$ ${amt} | EventID: ${e.id} | OrderID: ${orderId}`);
      }
    }
  });

  console.log("\nEvent Types Summary:", eventTypeMap);
  console.log(`August 2026 Total Purchase Sum in DB: R$ ${augSum.toFixed(2)} (Total Records: ${augCount})`);
  console.log(`Unique Orders Sum: R$ ${(augSum - duplicateSum).toFixed(2)} (Duplicates: ${duplicateCount})`);

  // Check campaigns table
  const { data: camps } = await client.from("campaigns").select("*");
  console.log("\nCampaigns DB State:");
  camps.forEach(c => {
    console.log(`Campaign ${c.id} (${c.name}): sent_count=${c.sent_count}, bounce_count=${c.bounce_count}, open_count=${c.open_count}`);
  });
}

checkRevenue();
