const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

c = c.replace(
  'const campId = payload.campaign_id || payload.campaignId || "default";',
  'const campId = payload.campaign_id || payload.campaignId || payload.node_id || payload.flow_id || "default";'
);

fs.writeFileSync('src/app/dashboard/page.tsx', c);
console.log('Modified dashboard/page.tsx metrics safely');
