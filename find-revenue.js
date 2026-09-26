const fs = require('fs');
const c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
const lines = c.split('\n');
const starts = [];
lines.forEach((l, i) => {
  if (l.includes('finalRevenue')) {
    starts.push(i);
  }
});
starts.forEach(i => {
  console.log('--- Line ' + i + ' ---');
  console.log(lines.slice(Math.max(0, i - 15), i + 15).join('\n'));
});
