const fs = require('fs');
let f = fs.readFileSync('src/app/api/segments/evaluate/route.ts', 'utf8');

const parseLogic = `
  const campaignId = parsedValue?.specificCampaign || rule.campaignId;
  const campaignScope = parsedValue?.campaignScope || 'Qualquer campanha';
  const timeframeMode = parsedValue?.timeframeMode || 'last_days';
  const daysCount = parseInt(parsedValue?.daysCount || '30', 10);
  
  const isWithinTimeframe = (dateStr: string) => {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    if (timeframeMode === 'last_days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysCount);
      return date >= cutoff;
    }
    // Could add custom date range here later
    return true;
  };
`;

f = f.replace(
  `  const campaignId = parsedValue?.specificCampaign || rule.campaignId;`,
  parseLogic
);

f = f.replace(
  `      const receivedByMe = [...data.emailSent, ...data.emailOpens, ...data.emailClicks].filter((e: any) =>
        e.payload?.email === contact.email || e.payload?.contact_id === contact.id
      );`,
  `      const receivedByMe = [...data.emailSent, ...data.emailOpens, ...data.emailClicks].filter((e: any) =>
        (e.payload?.email === contact.email || e.payload?.contact_id === contact.id) && isWithinTimeframe(e.created_at)
      );`
);

f = f.replace(
  `      const opensForMe = data.emailOpens.filter((e: any) =>
        e.payload?.email === contact.email || e.payload?.contact_id === contact.id
      );`,
  `      const opensForMe = data.emailOpens.filter((e: any) =>
        (e.payload?.email === contact.email || e.payload?.contact_id === contact.id) && isWithinTimeframe(e.created_at)
      );`
);

f = f.replace(
  `      const clicksForMe = data.emailClicks.filter((e: any) =>
        e.payload?.email === contact.email || e.payload?.contact_id === contact.id
      );`,
  `      const clicksForMe = data.emailClicks.filter((e: any) =>
        (e.payload?.email === contact.email || e.payload?.contact_id === contact.id) && isWithinTimeframe(e.created_at)
      );`
);

f = f.replace(
  /if \(campaignId && campaignId !== 'any'\) \{/g,
  `if (campaignScope === 'Campanha específica' && campaignId) {`
);

fs.writeFileSync('src/app/api/segments/evaluate/route.ts', f);
console.log('Added timeframe and campaignScope logic');
