const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

c = c.replace(
  /initialConfig=\{nodes\.find\(n => n\.id === 'trigger'\)\?\.config\}/,
  'initialConfig={{...nodes.find(n => n.id === "trigger")?.config, fallbackEvent: flow.triggerMetric}}'
);

fs.writeFileSync('src/components/FlowCanvas.tsx', c);
console.log('Fixed initialConfig prop');
