const fs = require('fs');
let c = fs.readFileSync('src/app/api/webhooks/aws-ses/route.ts', 'utf8');

const search = 'await supabase.from("inbound_webhook_events").insert({';
let idx = c.indexOf(search);
console.log(c.substring(idx, idx + 800));
