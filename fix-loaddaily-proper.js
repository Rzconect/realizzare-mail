const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const regex = /if \(dbCampaigns && dbCampaigns\.length > 0\) \{\n\s*dbCampaigns\.forEach\(\(c: any\) => \{\n\s*const dateObj = new Date\(c\.sent_at \|\| c\.created_at\);\n\s*const eventTime = dateObj\.getTime\(\);\n\s*if \(eventTime >= start\.getTime\(\) && eventTime <= end\.getTime\(\)\) \{\n\s*const label = formatLabel\(dateObj\);\n\s*const entry = slotMap\.get\(label\);\n\s*if \(entry\) \{\n\s*const deliveredSuccessful = Math\.max\(0, \(c\.sent_count \|\| 0\) - \(c\.bounce_count \|\| 0\)\);\n\s*entry\.envios \+= deliveredSuccessful;\n\s*entry\.abertos \+= c\.open_count \|\| 0;\n\s*entry\.clicados \+= c\.click_count \|\| 0;\n\s*\}\n\s*\}\n\s*\}\);\n\s*\}/;

const targetString = `if (dbCampaigns && dbCampaigns.length > 0) {
          dbCampaigns.forEach((c: any) => {
            const dateObj = new Date(c.sent_at || c.created_at);
            const eventTime = dateObj.getTime();
            if (eventTime >= start.getTime() && eventTime <= end.getTime()) {
              const label = formatLabel(dateObj);
              const entry = slotMap.get(label);
              if (entry) {
                const deliveredSuccessful = Math.max(0, (c.sent_count || 0) - (c.bounce_count || 0));
                entry.envios += deliveredSuccessful;
                entry.abertos += c.open_count || 0;
                entry.clicados += c.click_count || 0;
              }
            }
          });
        }`;

const block = `if (dbCampaigns && dbCampaigns.length > 0) {
          dbCampaigns.forEach((c: any) => {
            const dateObj = new Date(c.sent_at || c.created_at);
            const eventTime = dateObj.getTime();
            if (eventTime >= start.getTime() && eventTime <= end.getTime()) {
              const label = formatLabel(dateObj);
              const entry = slotMap.get(label);
              if (entry) {
                const deliveredSuccessful = Math.max(0, (c.sent_count || 0) - (c.bounce_count || 0));
                entry.envios += deliveredSuccessful;
                entry.abertos += c.open_count || 0;
                entry.clicados += c.click_count || 0;
              }
            }
          });
        }

        const { data: dbFlowSends } = await supabase
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
        }`;

c = c.replace(targetString, block);
fs.writeFileSync('src/app/dashboard/page.tsx', c);
console.log('Fixed dashboard metrics properly');
