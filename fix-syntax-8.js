const fs = require('fs');

const lines = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8').split(/\r?\n/);
let idx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '</>' && lines[i+1].trim() === ');' && lines[i+2].trim() === '})()') {
    idx = i;
    break;
  }
}

if (idx !== -1) {
  lines.splice(idx, 0, '</div>', '</div>');
  fs.writeFileSync('src/app/dashboard/conversations/page.tsx', lines.join('\n'));
  console.log('Inserted missing divs');
} else {
  console.log('Could not find </>');
}
