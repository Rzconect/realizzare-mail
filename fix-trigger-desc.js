const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

const oldStr = '          let description = `Fonte: ${config.source.toUpperCase()}`;\r\n          if (ruleText) {\r\n            description += ` - Regras: ${ruleText}`;\r\n          }\r\n';
const newStr = '          let description = `Fonte: ${config.source.toUpperCase()}`;\r\n          if (ruleText && config.rule !== "Nenhuma regra extra") {\r\n            // Include operator in brackets so evaluateTriggerRule can parse correctly\r\n            description += ` - Regras: [${config.operator || "\\u00e9 igual a"}] ${ruleText}`;\r\n          }\r\n';

if (c.includes(oldStr)) {
  c = c.replace(oldStr, newStr);
  fs.writeFileSync('src/components/FlowCanvas.tsx', c);
  console.log('saved');
} else {
  console.log('NOT FOUND. Trying alternate...');
  // Try without trailing \r
  const oldAlt = '          let description = `Fonte: ${config.source.toUpperCase()}`;\r\n          if (ruleText) {\r\n            description += ` - Regras: ${ruleText}`;\r\n          }';
  if (c.includes(oldAlt)) {
    c = c.replace(oldAlt, newStr.trimEnd());
    fs.writeFileSync('src/components/FlowCanvas.tsx', c);
    console.log('saved alt');
  } else {
    console.log('NEITHER found. Manual check needed.');
  }
}
