const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

const regex = /config: \{ triggerDescription: description \}/g;
c = c.replace(regex, 'config: { ...config, triggerDescription: description }');

fs.writeFileSync('src/components/FlowCanvas.tsx', c);
console.log('Fixed FlowCanvas save payload');
