const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/automations/page.tsx', 'utf8');

const regex = /\.insert\(\{\s*org_id: "00000000-0000-0000-0000-000000000001",\s*name: trimmedName,\s*description: triggerDesc,\s*status: "draft",\s*trigger_type: "event",\s*metrics_json: \{\s*active_contacts: 0,\s*revenue: 0\s*\}\s*\}\s*as\s*any\)/;

const match = c.match(regex);
if (match) {
    const block = `.insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          name: trimmedName,
          status: "draft",
          trigger_type: triggerDesc || "event"
        } as any)`;
    c = c.replace(regex, block);
    fs.writeFileSync('src/app/dashboard/automations/page.tsx', c);
    console.log('Fixed insert block');
} else {
    console.log("Could not find insert block");
}
