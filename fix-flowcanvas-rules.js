const fs = require('fs');
let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

// For entry:
const regex = /if \(config\.rule === "Nome do Curso específico"\) \{[\s\S]*?\} else if \(config\.rule !== "Nenhuma regra extra"\) \{[\s\S]*?\}/;
c = c.replace(regex, `if (config.rule && config.rule !== "Nenhuma regra extra") {
            const val = Array.isArray(config.value) && config.value.length > 1 ? \`\${config.value[0]} e mais \${config.value.length - 1}\` : (Array.isArray(config.value) ? config.value[0] : config.value);
            const op = config.operator || "";
            ruleText = \`\${config.rule} [\${op}] \${val}\`;
          }`);

// For exit and split:
c = c.replace(/operator: config\.rule/g, 'operator: config.operator || config.rule');

fs.writeFileSync('src/components/FlowCanvas.tsx', c);
console.log('Fixed FlowCanvas rules');
