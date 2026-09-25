const fs = require('fs');
let c = fs.readFileSync('src/components/TriggerConfigModal.tsx', 'utf8');

c = c.replace(
  'if (initialConfig.event) setSelectedEvent(initialConfig.event);',
  `if (initialConfig.event) setSelectedEvent(initialConfig.event);
      else if (initialConfig.fallbackEvent) setSelectedEvent(initialConfig.fallbackEvent);
      
      if (!initialConfig.source && initialConfig.triggerDescription) {
          const desc = initialConfig.triggerDescription.toLowerCase();
          if (desc.includes('pagarme')) setCustomTriggerSource('pagarme');
          else if (desc.includes('datalayer')) setCustomTriggerSource('datalayer');
          else setCustomTriggerSource('api');
      }`
);

fs.writeFileSync('src/components/TriggerConfigModal.tsx', c);
console.log('Fixed TriggerConfigModal fallback logic');
