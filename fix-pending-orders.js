const fs = require('fs');
let c = fs.readFileSync('src/app/api/crm/sync/route.ts', 'utf8');

const target = `    // Group by pagarme_id to find orders that are ONLY pending (no 'paid' event)
        const orderMap = new Map();
    [...(pendingEvents || [])].forEach(evt => {
       const amt = evt.metadata?.amount || "0";
       const timeStr = new Date(evt.created_at).toISOString().slice(0, 16); // up to minute
       const key = \`\${amt}-\${timeStr}\`;`;

const replacement = `    // Group by pagarme_id to correctly identify matching pending and paid events for the exact same order
    const orderMap = new Map();
    [...(pendingEvents || [])].forEach(evt => {
       // Primary key is pagarme_id. Fallback to amount-time(10min window)-email if legacy/missing
       let key = evt.metadata?.pagarme_id;
       if (!key) {
           const amt = evt.metadata?.amount || "0";
           const timeStr = new Date(evt.created_at).toISOString().slice(0, 15); // up to 10 minutes
           key = \`\${evt.contact_email}-\${amt}-\${timeStr}\`;
       }`;

c = c.replace(target, replacement);

fs.writeFileSync('src/app/api/crm/sync/route.ts', c);
console.log('done');
