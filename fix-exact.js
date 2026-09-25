const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

const target = '} ${config.value}`;\n          }';
const idx = c.indexOf(target);
if (idx !== -1) {
    c = c.substring(0, idx) + '}' + c.substring(idx + target.length);
    fs.writeFileSync('src/components/FlowCanvas.tsx', c);
    console.log('Fixed exactly!');
} else {
    console.log('Could not find exact string');
}
