const fs = require('fs');
let f = fs.readFileSync('src/app/api/segments/evaluate/route.ts', 'utf8');

// Parse rule value if it's JSON
const parseLogic = `
  // Try parsing value if it's JSON (used by engagement fields)
  let parsedValue = value;
  try {
    if (typeof value === 'string' && value.startsWith('{')) {
      parsedValue = JSON.parse(value);
    }
  } catch (e) {}

  const campaignId = parsedValue?.specificCampaign || rule.campaignId;
`;

f = f.replace(
  `  const field = normalizedField;`,
  `  const field = normalizedField;
${parseLogic}`
);

// Update email_received, email_opened, email_clicked to use parsed campaignId
f = f.replace(
  `      // Apply time filter if rule has timeframe
      return receivedByMe.length > 0;`,
  `      if (campaignId && campaignId !== 'any') {
        return receivedByMe.some((e: any) => e.payload?.campaign_id === campaignId);
      }
      return receivedByMe.length > 0;`
);

f = f.replace(
  `      if (rule.campaignId && rule.campaignId !== 'any') {
        return opensForMe.some((e: any) => e.payload?.campaign_id === rule.campaignId);
      }`,
  `      if (campaignId && campaignId !== 'any') {
        return opensForMe.some((e: any) => e.payload?.campaign_id === campaignId);
      }`
);

f = f.replace(
  `      if (rule.campaignId && rule.campaignId !== 'any') {
        return clicksForMe.some((e: any) => e.payload?.campaign_id === rule.campaignId);
      }`,
  `      if (campaignId && campaignId !== 'any') {
        return clicksForMe.some((e: any) => e.payload?.campaign_id === campaignId);
      }`
);

fs.writeFileSync('src/app/api/segments/evaluate/route.ts', f);
console.log('Updated evaluate route with parsed campaignId');
