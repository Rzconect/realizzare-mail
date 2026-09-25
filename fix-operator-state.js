const fs = require('fs');
let c = fs.readFileSync('src/components/TriggerConfigModal.tsx', 'utf8');

c = c.replace(
  'const [selectedRule, setSelectedRule] = useState("Nenhuma regra extra");',
  'const [selectedRule, setSelectedRule] = useState("Nenhuma regra extra");\n  const [selectedOperator, setSelectedOperator] = useState("É igual a");'
);

const onSaveRegex = /onSave\(\{\s*source: customTriggerSource,\s*event: selectedEvent,\s*rule: selectedRule,\s*value: selectedRule === "Nome do Curso específico" \? selectedCourses\.join\(", "\) : condValue,\s*(.*?)\}\);/s;

// We need to inject operator into onSave payload, and also read it from initialConfig!
let foundUseEffect = false;
c = c.replace(/useEffect\(\(\) => \{[\s\S]*?\}\, \[isOpen\]\);/g, (match) => {
    foundUseEffect = true;
    if (match.includes('initialConfig?.rule')) {
       return match.replace(
         'setSelectedRule(initialConfig.rule || "Nenhuma regra extra");',
         'setSelectedRule(initialConfig.rule || "Nenhuma regra extra");\n      setSelectedOperator(initialConfig.operator || "É igual a");'
       );
    }
    return match;
});

c = c.replace(/onSave\(\{([\s\S]*?)\}\);/g, (match, inner) => {
   if (inner.includes('source: customTriggerSource') && !inner.includes('operator:')) {
      return `onSave({${inner}, operator: selectedOperator});`;
   }
   return match;
});

fs.writeFileSync('src/components/TriggerConfigModal.tsx', c);
console.log('Added operator state and payload');
