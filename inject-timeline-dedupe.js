const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(
  'const key = `${e.label}-${e.details}-${e.timestamp}`;',
  `let timeKey = e.timestamp;
            if (e.type === "open" || e.type === "email_click") {
              // Truncate to the minute (YYYY-MM-DDTHH:mm) to deduplicate rapid multiple opens
              timeKey = typeof timeKey === "string" ? timeKey.substring(0, 16) : timeKey;
            }
            const key = \`\${e.label}-\${e.details}-\${timeKey}\`;`
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Modified deduplication logic cleanly');
