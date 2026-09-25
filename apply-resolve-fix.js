const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

c = c.replace(
  'parent_node_id: null,',
  'parent_node_id: null,\n                     branch_label: null,'
);

c = c.replace(
  'n.branch_label === branchLabel',
  '(n.branch_label || null) === (branchLabel || null)'
);

fs.writeFileSync('src/components/FlowCanvas.tsx', c);
console.log('Applied resolveSequence bug fix cleanly');
