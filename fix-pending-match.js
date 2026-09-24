const fs = require('fs');
let c = fs.readFileSync('src/app/api/crm/sync/route.ts', 'utf8');

const target = `    // Group by pagarme_id to correctly identify matching pending and paid events for the exact same order
    const orderMap = new Map();
    [...(pendingEvents || [])].forEach(evt => {
       // Primary key is pagarme_id. Fallback to amount-time(10min window)-email if legacy/missing
       let key = evt.metadata?.pagarme_id;
       if (!key) {
           const amt = evt.metadata?.amount || "0";
           const timeStr = new Date(evt.created_at).toISOString().slice(0, 15); // up to 10 minutes
           key = \`\${evt.contact_email}-\${amt}-\${timeStr}\`;
       }
       
       const isPaidEvent = evt.metadata?.event?.includes("paid") || evt.metadata?.status === "paid";
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
           existing.metadata.item_title = title;
         }
       }
    });

    const onlyPending = Array.from(orderMap.values())
      .filter(o => !o.isPaid && !o._isArchived)
      .slice(0, 50);`;

const replacement = `    // Match pending and paid events robustly
    const pendingList: any[] = [];
    const paidList: any[] = [];
    
    [...(pendingEvents || [])].forEach(evt => {
       const isPaidEvent = evt.metadata?.event?.includes("paid") || evt.metadata?.status === "paid";
       const evtData = { ...evt, isPaid: isPaidEvent, _isArchived: evt.metadata?.crm_archived === true };
       if (isPaidEvent) paidList.push(evtData);
       else pendingList.push(evtData);
    });

    // For each pending, try to find if it was paid
    const truePending = pendingList.filter(pending => {
       if (pending._isArchived) return false;
       
       const pendingId = pending.metadata?.pagarme_id;
       const pendingAmt = pending.metadata?.amount || 0;
       const pendingEmail = pending.contact_email;
       const pendingTime = new Date(pending.created_at).getTime();

       // 1. Try exact pagarme_id match (only if they both have or_ or ch_)
       let matchingPaid = paidList.find(p => p.metadata?.pagarme_id && pendingId && p.metadata.pagarme_id === pendingId);
       
       // 2. Try fuzzy match (same email, same amount, within 60 minutes)
       if (!matchingPaid) {
          matchingPaid = paidList.find(p => {
             if (p.contact_email !== pendingEmail) return false;
             if ((p.metadata?.amount || 0) !== pendingAmt) return false;
             
             const paidTime = new Date(p.created_at).getTime();
             const diffMinutes = Math.abs(paidTime - pendingTime) / (1000 * 60);
             return diffMinutes <= 60; // if paid within 60 minutes of pending, it's the same order
          });
       }
       
       // If a paid event matched this pending event, then this pending is resolved!
       if (matchingPaid) return false;
       return true;
    });

    // Deduplicate truePending by pagarme_id/fuzzy so we don't show the same pending order twice (e.g. order.created and charge.pending)
    const uniquePending: any[] = [];
    for (const p of truePending) {
       const hasDuplicate = uniquePending.find(u => 
          (u.metadata?.pagarme_id && p.metadata?.pagarme_id && u.metadata.pagarme_id === p.metadata.pagarme_id) ||
          (u.contact_email === p.contact_email && (u.metadata?.amount||0) === (p.metadata?.amount||0) && Math.abs(new Date(u.created_at).getTime() - new Date(p.created_at).getTime())/(1000*60) <= 60)
       );
       if (!hasDuplicate) uniquePending.push(p);
       else {
          // Keep best title
          const existingTitle = hasDuplicate.metadata?.item_title || "";
          const newTitle = p.metadata?.item_title || "";
          if (newTitle && !newTitle.includes("Certificado / Curso") && existingTitle.includes("Certificado / Curso")) {
             hasDuplicate.metadata.item_title = newTitle;
          }
       }
    }

    const onlyPending = uniquePending.slice(0, 50);`;

c = c.replace(target, replacement);

fs.writeFileSync('src/app/api/crm/sync/route.ts', c);
console.log('done');
