const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

let lines = c.split('\n');
let replyingToDeclCount = 0;
let newLines = [];
for (let line of lines) {
  if (line.includes('const [replyingTo, setReplyingTo] =')) {
    replyingToDeclCount++;
    if (replyingToDeclCount > 1) {
      continue; // skip duplicate
    }
  }
  newLines.push(line);
}

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', newLines.join('\n'));
console.log('Fixed duplicates');
