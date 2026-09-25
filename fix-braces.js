const fs = require('fs');
let c = fs.readFileSync('src/components/TriggerConfigModal.tsx', 'utf8');

c = c.replace(
  /} else if \(isOpen\) \{\s*setSelectedEvent\(\"\"\);\s*setSelectedRule\(\"Nenhuma regra extra\"\);\s*setCondValue\(\"\"\);\s*setSelectedCourses\(\[\]\);\s*setTimeWindow\(\"\"\);\s*\}, \[customTriggerSource\]\);/g,
  `} else if (isOpen) {\n      setSelectedEvent("");\n      setSelectedRule("Nenhuma regra extra");\n      setCondValue("");\n      setSelectedCourses([]);\n      setTimeWindow("");\n    }\n  }, [customTriggerSource, isOpen, initialConfig]);`
);
fs.writeFileSync('src/components/TriggerConfigModal.tsx', c);
console.log('Fixed braces');
