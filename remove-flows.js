const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const startIndex = c.indexOf('{/* Active Automation Flows List */}');
const endIndex = c.indexOf('{/* Event Details Modal */}');

if (startIndex !== -1 && endIndex !== -1) {
  c = c.substring(0, startIndex) + c.substring(endIndex);
  fs.writeFileSync('src/app/dashboard/page.tsx', c);
  console.log('done');
} else {
  console.log('indices not found', startIndex, endIndex);
}
