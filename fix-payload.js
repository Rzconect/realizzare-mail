const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(
  /function formatPayloadKeyValues\(payload: any\): Array<\{ key: string; value: string \}> \{/,
  'function formatPayloadKeyValues(payload: any, eventType?: string): Array<{ key: string; value: string }> {'
);

c = c.replace(
  /if \(val === null \|\| val === undefined \|\| rawKey === "org_id" \|\| rawKey === "contact_id"\) return;/,
  `if (val === null || val === undefined || rawKey === "org_id" || rawKey === "contact_id") return;
      if (eventType === "open" || eventType === "email_click") {
        if (rawKey === "flow_id" || rawKey === "node_id" || rawKey === "campaign_id") return;
      }`
);

c = c.replace(
  /formatPayloadKeyValues\(event\.payload\)/g,
  'formatPayloadKeyValues(event.payload, event.type)'
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed formatPayloadKeyValues');
