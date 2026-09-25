const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

const regex = /const handleOpenQueueModal = \(node: FlowNode, statusName: string, count: number\) => \{\s*setQueueModalNode\(node\);\s*setQueueModalStatusName\(statusName\);\s*setQueueModalCount\(count\);\s*setQueueSearchQuery\(""\);\s*setShowQueueModal\(true\);\s*\};/g;

const match = c.match(regex);
if (match) {
    const block = `const handleOpenQueueModal = async (node: FlowNode, statusName: string, count: number) => {
    setQueueModalNode(node);
    setQueueModalStatusName(statusName);
    setQueueModalCount(count);
    setQueueSearchQuery("");
    setQueueLeads([]); // clear previous
    setShowQueueModal(true);
    
    try {
      const res = await fetch(\`/api/flows/queue?nodeId=\${node.id}\`);
      if (res.ok) {
        const data = await res.json();
        setQueueLeads(data.leads || []);
      }
    } catch (err) {
      console.error(err);
    }
  };`;
    c = c.replace(regex, block);
    fs.writeFileSync('src/components/FlowCanvas.tsx', c);
    console.log('Fixed handleOpenQueueModal');
} else {
    console.log('Could not find handleOpenQueueModal');
}
