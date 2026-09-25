const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const search = '// 2. Fetch real tracking events';
const block = `const { data: dbFlowSends } = await supabase
          .from("flow_run_logs")
          .select("created_at")
          .like("action_taken", "E-mail enviado%");

        if (dbFlowSends && dbFlowSends.length > 0) {
          dbFlowSends.forEach((c: any) => {
            const dateObj = new Date(c.created_at);
            const eventTime = dateObj.getTime();
            if (eventTime >= start.getTime() && eventTime <= end.getTime()) {
              const label = formatLabel(dateObj);
              const entry = slotMap.get(label);
              if (entry) {
                entry.envios += 1;
              }
            }
          });
        }
        
        // 2. Fetch real tracking events`;

const replaced = c.split(search).join(block);
fs.writeFileSync('src/app/dashboard/page.tsx', replaced);
console.log('Fixed dashboard metrics perfectly');
