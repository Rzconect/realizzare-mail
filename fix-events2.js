const fs = require('fs');
let c = fs.readFileSync('src/components/crm/DealModal.tsx', 'utf8');

// Replace grouping logic
const targetGroup = `             events.forEach((evt: any) => {
                const isPaid = evt.metadata?.status === 'paid' || evt.event === 'order.paid' || evt.metadata?.event === 'order.paid' || evt.metadata?.event === 'charge.paid';
                const pId = evt.metadata?.pagarme_id || evt.id;
                const title = evt.metadata?.item_title || evt.metadata?.course_name;
                const amt = evt.metadata?.amount;
                
                const key = evt.metadata?.pagarme_id ? \`\${pId}-\${isPaid}\` : \`\${title}-\${amt}-\${isPaid}\`;
                
                if (!seen.has(key)) {
                  seen.add(key);
                  uniqueEvents.push(evt);
                }
             });`;

const replacementGroup = `             events.forEach((evt: any) => {
                const isPaid = evt.metadata?.status === 'paid' || evt.event === 'order.paid' || evt.metadata?.event === 'order.paid' || evt.metadata?.event === 'charge.paid';
                const title = evt.metadata?.item_title || evt.metadata?.course_name || "Produto";
                const amt = evt.metadata?.amount || "0";
                const timeStr = new Date(evt.created_at).toISOString().slice(0, 16); // Up to minutes
                
                // Group by title + amount + isPaid + minute
                const key = \`\${title}-\${amt}-\${isPaid}-\${timeStr}\`;
                
                if (!seen.has(key)) {
                  seen.add(key);
                  uniqueEvents.push(evt);
                }
             });`;

c = c.replace(targetGroup, replacementGroup);

// Replace mapping logic
const targetMap = `                    timelineEvents.map((evt, idx) => {
                      const isPaid = evt.metadata?.status === 'paid' || evt.event === 'order.paid';`;

const replacementMap = `                    timelineEvents.map((evt, idx) => {
                      const isPaid = evt.metadata?.status === 'paid' || evt.event === 'order.paid' || evt.metadata?.event === 'order.paid' || evt.metadata?.event === 'charge.paid';`;

c = c.replace(targetMap, replacementMap);

fs.writeFileSync('src/components/crm/DealModal.tsx', c);
console.log('done');
