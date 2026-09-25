const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

c = c.replace(
  'const tree = resolveSequence(null, null);', 
  'const tree = resolveSequence(null, null);\nconsole.log("nodesData:", JSON.stringify(nodesData));\nconsole.log("resolveSequence result:", JSON.stringify(tree));'
);

fs.writeFileSync('src/components/FlowCanvas.tsx', c);
