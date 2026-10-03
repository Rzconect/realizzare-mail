const fs = require('fs');

let f = fs.readFileSync('src/app/api/campaigns/send/route.ts', 'utf8');

const insertStmt = `        successCount++;
        
        // Log delivery event to inbound_webhook_events
        await supabase.from("inbound_webhook_events").insert({
          event_type: "email.delivered",
          payload: {
            email: recipientEmail,
            contact_id: contactId,
            campaign_id: campaign.id,
            timestamp: new Date().toISOString()
          }
        });`;

f = f.replace('        successCount++;', insertStmt);

fs.writeFileSync('src/app/api/campaigns/send/route.ts', f);
console.log('Updated send route');
