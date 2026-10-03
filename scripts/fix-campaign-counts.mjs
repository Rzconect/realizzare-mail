/**
 * Fix campaign open/click counts by recalculating from inbound_webhook_events.
 * Uses DISTINCT email to deduplicate duplicate events caused by race conditions.
 *
 * Usage: node scripts/fix-campaign-counts.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const CAMPAIGN_ID = "7944c581-97d7-475a-94c3-7e8c1ed13386";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getDistinctCount(campaignId, eventType) {
  // Fetch all events of this type for the campaign, then deduplicate by email in JS
  // (PostgREST doesn't support SELECT DISTINCT COUNT natively without RPC)
  const { data, error } = await supabase
    .from("inbound_webhook_events")
    .select("payload")
    .eq("event_type", eventType)
    .filter("payload->>campaign_id", "eq", campaignId);

  if (error) {
    throw new Error(`Query error (${eventType}): ${error.message}`);
  }

  const uniqueEmails = new Set();
  for (const row of data ?? []) {
    const email = row.payload?.email;
    if (email) uniqueEmails.add(email.toLowerCase().trim());
  }

  return uniqueEmails.size;
}

async function fixCampaign(campaignId) {
  console.log(`\n=== Fixing campaign: ${campaignId} ===`);

  // Fetch current counts
  const { data: campaign, error: fetchErr } = await supabase
    .from("campaigns")
    .select("open_count, click_count")
    .eq("id", campaignId)
    .maybeSingle();

  if (fetchErr) throw new Error(`Failed to fetch campaign: ${fetchErr.message}`);
  if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);

  const beforeOpen = campaign.open_count ?? 0;
  const beforeClick = campaign.click_count ?? 0;

  console.log(`Before → open_count: ${beforeOpen}, click_count: ${beforeClick}`);

  // Recalculate distinct counts
  const distinctOpens = await getDistinctCount(campaignId, "email.open");
  const distinctClicks = await getDistinctCount(campaignId, "email.click");

  console.log(`Distinct openers: ${distinctOpens}, distinct clickers: ${distinctClicks}`);

  // Update campaign with correct counts
  const { error: updateErr } = await supabase
    .from("campaigns")
    .update({
      open_count: distinctOpens,
      click_count: distinctClicks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  if (updateErr) throw new Error(`Failed to update campaign: ${updateErr.message}`);

  console.log(`After  → open_count: ${distinctOpens}, click_count: ${distinctClicks}`);
  console.log(`✓ Campaign ${campaignId} updated successfully.`);
}

try {
  await fixCampaign(CAMPAIGN_ID);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
