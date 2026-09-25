const fs = require('fs');
let c = fs.readFileSync('src/app/api/crm/update/route.ts', 'utf8');

c = c.replace('table = "reporting_events";\n      rawId = id.replace("test-", "");', 'table = "course_events";\n      rawId = id.replace("test-", "");');
c = c.replace('if (payload.assignedTo) newMetadata.crm_assigned = payload.assignedTo;', 'if (payload.assignedTo) newMetadata.crm_assigned = payload.assignedTo;\n        if (payload.notes) newMetadata.crm_notes = payload.notes;');

fs.writeFileSync('src/app/api/crm/update/route.ts', c);
console.log('Updated route.ts');
