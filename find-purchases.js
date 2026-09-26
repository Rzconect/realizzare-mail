const fs = require('fs');
const c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('purchases') && (l.includes('select') || l.includes('paid_at') || l.includes('payment_method') || l.includes('reporting_events'))) {
    console.log(i+1 + ': ' + l.trim().substring(0, 150));
  }
}
