const fs = require('fs');
let c = fs.readFileSync('src/components/crm/DealModal.tsx', 'utf8');

const replacement = `         // 2. Fetch Timeline Events
         if (deal.email) {
           const { data: events } = await supabase
             .from('reporting_events')
             .select('*')
             .eq('contact_email', deal.email)
             .order('created_at', { ascending: false });
           
           if (events) {
             const uniqueEvents = [];
             const seen = new Set();
             
             events.forEach((evt) => {
                const isPaid = evt.metadata?.status === 'paid' || evt.event === 'order.paid' || evt.metadata?.event === 'order.paid' || evt.metadata?.event === 'charge.paid';
                const pId = evt.metadata?.pagarme_id || evt.id;
                const title = evt.metadata?.item_title || evt.metadata?.course_name;
                const amt = evt.metadata?.amount;
                
                const key = evt.metadata?.pagarme_id ? \`\${pId}-\${isPaid}\` : \`\${title}-\${amt}-\${isPaid}\`;
                
                if (!seen.has(key)) {
                  seen.add(key);
                  uniqueEvents.push(evt);
                }
             });
             setTimelineEvents(uniqueEvents);
           }
         }`;

// Use regex to find the block
const regex = /\/\/\ 2\.\ Fetch Timeline Events[\s\S]*?if\ \(events\)\ \{\s*setTimelineEvents\(events\);\s*\}\s*\}/;
c = c.replace(regex, replacement);

fs.writeFileSync('src/components/crm/DealModal.tsx', c);
console.log('done via regex');
