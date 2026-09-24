const fs = require('fs');
let c = fs.readFileSync('src/components/crm/DealModal.tsx', 'utf8');

const regex = /events\.forEach\(\(evt:\ any\)\ =>\ \{[\s\S]*?\}\);\s*setTimelineEvents\(uniqueEvents\);/;

const replacement = `             const grouped = new Map();
             
             events.forEach((evt: any) => {
                const isPaid = evt.metadata?.status === 'paid' || evt.event === 'order.paid' || evt.metadata?.event === 'order.paid' || evt.metadata?.event === 'charge.paid';
                let title = evt.metadata?.item_title || evt.metadata?.course_name || "Produto";
                const amt = evt.metadata?.amount || "0";
                const timeStr = new Date(evt.created_at).toISOString().slice(0, 16); // Up to minutes
                
                // If title is the fallback, mark it so we can prefer real titles
                const isFallback = title.includes("Certificado / Curso Realizzare");
                
                // Group by amount + minute
                const key = \`\${amt}-\${timeStr}\`;
                
                if (!grouped.has(key)) {
                  grouped.set(key, { ...evt, _isPaid: isPaid, _isFallback: isFallback, _title: title });
                } else {
                  const existing = grouped.get(key);
                  // Prefer paid status
                  if (isPaid) existing._isPaid = true;
                  // Prefer real title over fallback
                  if (existing._isFallback && !isFallback) {
                    existing._title = title;
                    existing._isFallback = false;
                    existing.metadata = { ...existing.metadata, item_title: title }; // Update metadata for rendering
                  }
                  // If we upgraded to paid, update metadata event so mapping logic renders it green
                  if (isPaid && (!existing.metadata?.event || !existing.metadata.event.includes('paid'))) {
                    existing.metadata = { ...existing.metadata, event: 'order.paid' };
                  }
                }
             });
             
             setTimelineEvents(Array.from(grouped.values()));`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/components/crm/DealModal.tsx', c);
console.log('done');
