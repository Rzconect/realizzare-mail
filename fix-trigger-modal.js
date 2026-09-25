const fs = require('fs');
let c = fs.readFileSync('src/components/TriggerConfigModal.tsx', 'utf8');

c = c.replace(
  /export default function TriggerConfigModal\(\{ isOpen, onClose, onSave, mode = "entry" \}: TriggerConfigModalProps\) \{/,
  `export default function TriggerConfigModal({ isOpen, onClose, onSave, mode = "entry", initialConfig }: TriggerConfigModalProps & { initialConfig?: any }) {`
);

c = c.replace(
  /useEffect\(\(\) => \{\s*setSelectedEvent\(\"\"\);\s*setSelectedRule\(\"Nenhuma regra extra\"\);/,
  `useEffect(() => {
    if (initialConfig && isOpen) {
      if (initialConfig.source) setCustomTriggerSource(initialConfig.source);
      if (initialConfig.event) setSelectedEvent(initialConfig.event);
      if (initialConfig.rule) setSelectedRule(initialConfig.rule);
      if (initialConfig.value) {
        setCondValue(initialConfig.value);
        if (Array.isArray(initialConfig.value)) {
          setSelectedCourses(initialConfig.value);
        }
      }
      if (initialConfig.timeWindow) setTimeWindow(initialConfig.timeWindow);
      if (initialConfig.timeUnit) setTimeUnit(initialConfig.timeUnit);
    } else if (isOpen) {
      setSelectedEvent("");
      setSelectedRule("Nenhuma regra extra");`
);

fs.writeFileSync('src/components/TriggerConfigModal.tsx', c);
console.log('Fixed TriggerConfigModal');
