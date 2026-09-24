const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const target = `        // Deduplicate legacy split webhooks for purchases (ch_ vs or_ with same amount/date)
        const purchaseDedupeMap = new Map();
        (contact.purchases || []).forEach((p: any) => {
           const dateStr = p.paid_at ? new Date(p.paid_at).toISOString().split("T")[0] : (p.created_at || "").split("T")[0];
           const amt = Number(p.amount || 0).toFixed(2);
           const key = \`\${amt}_\${dateStr}\`;
           
           if (!purchaseDedupeMap.has(key)) {
              purchaseDedupeMap.set(key, p);
           } else {
              const existing = purchaseDedupeMap.get(key);
              if (existing.product_name === "Certificado / Curso Realizzare" && p.product_name !== "Certificado / Curso Realizzare") {
                 purchaseDedupeMap.set(key, p); // overwrite fallback with real title
              } else if (existing.product_name !== "Certificado / Curso Realizzare" && p.product_name === "Certificado / Curso Realizzare") {
                 // ignore fallback, keep real title
              } else {
                 // both are real (genuine duplicate purchase) or both fallback. Keep both!
                 purchaseDedupeMap.set(key + "_" + p.id, p);
              }
           }
        });

        const purchases = Array.from(purchaseDedupeMap.values()).map((p: any) => ({`;

const replacement = `        // Deduplicate webhooks for purchases (concurrent order.paid and charge.paid)
        const uniqueSkus = new Set();
        const purchaseDedupeMap = new Map();
        
        (contact.purchases || []).forEach((p: any) => {
           // 1. Primary Deduplication: Exact SKU (prevents race conditions from duplicating purchases)
           if (p.sku && uniqueSkus.has(p.sku)) return;
           if (p.sku) uniqueSkus.add(p.sku);

           // 2. Secondary Deduplication: legacy split webhooks (same amount/date)
           const dateStr = p.paid_at ? new Date(p.paid_at).toISOString().split("T")[0] : (p.created_at || "").split("T")[0];
           const amt = Number(p.amount || 0).toFixed(2);
           const key = \`\${amt}_\${dateStr}\`;
           
           if (!purchaseDedupeMap.has(key)) {
              purchaseDedupeMap.set(key, p);
           } else {
              const existing = purchaseDedupeMap.get(key);
              if (existing.product_name === "Certificado / Curso Realizzare" && p.product_name !== "Certificado / Curso Realizzare") {
                 purchaseDedupeMap.set(key, p); // overwrite fallback with real title
              } else if (existing.product_name !== "Certificado / Curso Realizzare" && p.product_name === "Certificado / Curso Realizzare") {
                 // ignore fallback, keep real title
              } else if (p.sku && existing.sku && p.sku !== existing.sku) {
                 // both are real and have DIFFERENT SKUs (genuine duplicate purchase). Keep both!
                 purchaseDedupeMap.set(key + "_" + p.id, p);
              } else if (!p.sku) {
                 // No sku, fallback to keeping both
                 purchaseDedupeMap.set(key + "_" + p.id, p);
              }
           }
        });

        const purchases = Array.from(purchaseDedupeMap.values()).map((p: any) => ({`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
  console.log('done');
} else {
  console.log('target not found');
}
