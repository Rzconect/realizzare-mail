const fs = require('fs');

const lines = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8').split(/\r?\n/);
const idx = lines.findIndex(l => l.trim() === '</>' && lines[Math.max(0, lines.indexOf(l) + 1)].trim() === ');');

if (idx !== -1) {
  lines.splice(idx, 0, '</div>', '</div>');
  fs.writeFileSync('src/app/dashboard/conversations/page.tsx', lines.join('\n'));
  console.log('Inserted missing divs');
} else {
  console.log('Could not find </>');
}
