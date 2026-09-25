const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

const startStr = 'if (config.rule === "Nome do Curso específico") {';
const endStr = '} else if (config.rule !== "Nenhuma regra extra") {\n            ruleText = `${config.rule} ${config.value}`;\n          }';

const startIdx = c.indexOf(startStr);
const endIdx = c.indexOf(endStr);
if (startIdx !== -1 && endIdx !== -1) {
    const replaceWith = `if (config.rule && config.rule !== "Nenhuma regra extra") {
            const val = Array.isArray(config.value) && config.value.length > 1 ? \`\${config.value[0]} e mais \${config.value.length - 1}\` : (Array.isArray(config.value) ? config.value[0] : config.value);
            const op = config.operator || "";
            ruleText = \`\${config.rule} [\${op}] \${val}\`;
          }`;
    c = c.substring(0, startIdx) + replaceWith + c.substring(endIdx + endStr.length);
}

// For exit and split:
c = c.replace(/operator: config\.rule/g, 'operator: config.operator || config.rule');

// Don't forget to restore the fix-link fix too:
c = c.replace(
  /href=\{\`\/dashboard\/contacts\`\}/g,
  'href={`/dashboard/contacts/${lead.id}`}'
);


fs.writeFileSync('src/components/FlowCanvas.tsx', c);
console.log('Fixed properly');
