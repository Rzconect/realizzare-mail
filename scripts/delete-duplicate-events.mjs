/**
 * One-shot script: deletes known duplicate reporting_events for
 * leonardo.carbon@hotmail.com (charge.pending + order.created duplicates).
 *
 * Run: node scripts/delete-duplicate-events.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Read .env.local for credentials
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");

function parseEnv(content) {
  const vars = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    vars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return vars;
}

const env = parseEnv(envContent);
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DUPLICATE_IDS = [
  "126cbc10-33fb-4971-9cd2-7d53370a8db5", // charge.pending — earlier duplicate
  "6eb1350c-efc0-495e-b315-d1b05ecc773a", // order.created — earlier duplicate
];

console.log("Deleting duplicate reporting_events:", DUPLICATE_IDS);

const { error, count } = await supabase
  .from("reporting_events")
  .delete({ count: "exact" })
  .in("id", DUPLICATE_IDS);

if (error) {
  console.error("Error deleting duplicates:", error.message);
  process.exit(1);
}

console.log(`✅ Deleted ${count} duplicate event(s) successfully.`);
