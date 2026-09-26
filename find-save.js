const fs = require('fs');
const c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.update(') && lines[i-1] && lines[i-1].includes('flows')) {
    console.log('Save at line', i+1, ':');
    console.log(lines.slice(i, i+30).join('\n'));
    break;
  }
  if (lines[i].includes('flows").update') || (lines[i].includes('.update({') && i > 800 && lines.slice(Math.max(0,i-3),i).some(l => l.includes('flows')))) {
    console.log('Found at line', i+1);
    console.log(lines.slice(i, i+25).join('\n'));
    break;
  }
}
