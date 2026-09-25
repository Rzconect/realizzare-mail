const fs = require('fs');
let c = fs.readFileSync('src/components/TriggerConfigModal.tsx', 'utf8');

const regex = /if \(\!initialConfig\.source && initialConfig\.triggerDescription\) \{[\s\S]*?else setCustomTriggerSource\('api'\);\n      \}/;

const replacement = `if (!initialConfig.source && initialConfig.triggerDescription) {
          const descStr = initialConfig.triggerDescription;
          const descLower = descStr.toLowerCase();
          
          if (descLower.includes('pagarme')) setCustomTriggerSource('pagarme');
          else if (descLower.includes('datalayer')) setCustomTriggerSource('datalayer');
          else setCustomTriggerSource('api');
          
          if (descStr.includes('Regras: ')) {
              const rulePart = descStr.split('Regras: ')[1].trim();
              
              if (rulePart.includes(' [') && rulePart.includes('] ')) {
                 const ruleName = rulePart.substring(0, rulePart.indexOf(' ['));
                 const operator = rulePart.substring(rulePart.indexOf(' [') + 2, rulePart.indexOf('] '));
                 const val = rulePart.substring(rulePart.indexOf('] ') + 2);
                 setSelectedRule(ruleName);
                 setSelectedOperator(operator);
                 setCondValue(val);
                 if (ruleName === "Nome do Curso específico") setSelectedCourses([val]);
              } else {
                 const operatorsOld = ["Igual a", "Não é igual a", "Contém", "Não contém", "Maior que (Valor/Data)", "Menor que (Valor/Data)"];
                 let matchedOldOp = false;
                 for (const op of operatorsOld) {
                    if (rulePart.startsWith(op + " ")) {
                        setSelectedRule("Nenhuma regra extra");
                        setSelectedOperator(op === "Igual a" ? "É igual a" : op);
                        setCondValue(rulePart.replace(op + " ", ""));
                        matchedOldOp = true;
                        break;
                    }
                 }
                 
                 if (!matchedOldOp) {
                    if (descLower.includes('pagarme') && !(initialConfig.event || initialConfig.fallbackEvent || "").toLowerCase().includes('matr')) {
                        setSelectedRule("SKU do Produto específico");
                        setCondValue(rulePart);
                    } else {
                        setSelectedRule("Nome do Curso específico");
                        setSelectedCourses([rulePart]);
                        setCondValue(rulePart);
                    }
                    setSelectedOperator("É igual a");
                 }
              }
          }
      }`;

c = c.replace(regex, replacement);

fs.writeFileSync('src/components/TriggerConfigModal.tsx', c);
console.log('Fixed TriggerConfigModal rules fallback');
