const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

const regex = /<TriggerConfigModal\s+isOpen=\{showTriggerModal\}\s+onClose=\{\(\) => setShowTriggerModal\(false\)\}\s+mode="entry"\s+onSave=\{\(config\) => \{/m;

const replacement = `<TriggerConfigModal 
        isOpen={showTriggerModal} 
        onClose={() => setShowTriggerModal(false)}
        mode="entry"
        initialConfig={nodes.find(n => n.id === 'trigger')?.config}
        onSave={(config) => {`;

c = c.replace(regex, replacement);

fs.writeFileSync('src/components/FlowCanvas.tsx', c);
console.log('Fixed TriggerConfigModal props');
