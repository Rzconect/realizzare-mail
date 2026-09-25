const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

const regex = /if \(nodesData && \!nodesError && nodesData\.length > 0\) \{/;
const replaceWith = `if (nodesData && !nodesError && nodesData.length > 0) {
               const hasTriggerNode = nodesData.some((n: any) => n.node_type === 'trigger' || n.id === 'trigger');
               if (!hasTriggerNode) {
                  nodesData.push({
                     id: "trigger",
                     node_type: "trigger",
                     parent_node_id: null,
                     config: { triggerDescription: found.trigger_type, name: found.trigger_metric && found.trigger_metric !== "Disparador" ? found.trigger_metric : "Defina seu gatilho de entrada" }
                  });
               }`;

c = c.replace(regex, replaceWith);

fs.writeFileSync('src/components/FlowCanvas.tsx', c);
console.log('Fixed missing trigger node in older flows');
