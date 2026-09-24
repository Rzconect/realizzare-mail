const fs = require('fs');
let c = fs.readFileSync('src/app/api/crm/sync/route.ts', 'utf8');

const regex = /const orderMap = new Map\(\);[\s\S]*?const activePending = Array\.from\(orderMap\.values\(\)\)\.filter\(o => !o\.isPaid\)\.slice\(0, 50\);/;

const replacement = `    const orderMap = new Map();
    [...courseEvents, ...allChargeEvents].forEach(evt => {
       const amt = evt.metadata?.amount || "0";
       const timeStr = new Date(evt.created_at).toISOString().slice(0, 16); // up to minute
       const key = \`\${amt}-\${timeStr}\`;
       
       const isPaidEvent = evt.metadata?.event?.includes("paid") || evt.event?.includes("paid") || evt.metadata?.status === "paid";
       const isArchived = evt.metadata?.crm_archived === true;
       
       if (!orderMap.has(key)) {
         orderMap.set(key, { ...evt, isPaid: isPaidEvent, _isArchived: isArchived });
       } else {
         const existing = orderMap.get(key);
         if (isPaidEvent) existing.isPaid = true;
         if (isArchived) existing._isArchived = true;
         
         // Keep the best metadata (e.g. non-fallback title)
         const title = evt.metadata?.item_title || evt.metadata?.course_name || "";
         const existingTitle = existing.metadata?.item_title || existing.metadata?.course_name || "";
         if (title && !title.includes("Certificado / Curso") && existingTitle.includes("Certificado / Curso")) {
           existing.metadata = { ...existing.metadata, item_title: title };
         }
         
         // Merge CRM states
         if (evt.metadata?.crm_column) existing.metadata.crm_column = evt.metadata.crm_column;
         if (evt.metadata?.crm_assigned) existing.metadata.crm_assigned = evt.metadata.crm_assigned;
       }
    });

    const activePending = Array.from(orderMap.values()).filter(o => !o.isPaid && !o._isArchived).slice(0, 50);`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/app/api/crm/sync/route.ts', c);
console.log('done');
