const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/campaigns/create/page.tsx', 'utf-8');

// 1. isSegment mapping
content = content.replace(/(name:\s*l\.name,\s*count:\s*count)\s*\}/, '$1,\n            isSegment: l.type === "segmentation" || l.type === "segment"\n          }');

// 2. Recomendações Prontas
content = content.replace(/\{\/\*\s*Atalhos de Segmenta[\s\S]*?(?=<div className="space-y-1\.5 relative">)/, '');

// 3. Dropdown start closed
content = content.replace(/<details className="group" open>/g, '<details className="group">');

// 4. Limit to 20 in modal (when no search query)
content = content.replace(/(\(\s*c\.last_name\s*&&\s*c\.last_name\.toLowerCase\(\)\.includes\(q\)\s*\)\s*;\s*\n\s*\s*\}\))(\s*\n\s*\.map\(\(c\)\s*=>\s*\{)/g, '$1\n                  .slice(0, contactSearchQuery.trim() ? undefined : 20)$2');

// 6. Modal View Contacts logic
const oldLogic = `                let isIncluded = false;
                if (selectedIncludeLists.includes(\`contact-\${c.id}\`)) {
                  isIncluded = true;
                } else if (c.list_ids && c.list_ids.some((lid: string) => selectedIncludeLists.includes(lid))) {
                  isIncluded = true;
                } else if (selectedIncludeLists.some((id) => id.startsWith("seg-"))) {
                  isIncluded = true;
                }

                if (!isIncluded) return false;

                if (!contactSearchQuery) return true;`;

const newLogic = `                let isIncluded = selectedIncludeLists.includes(\`contact-\${c.id}\`) || 
                                 (c.list_ids && c.list_ids.some((lid: string) => selectedIncludeLists.includes(lid)));

                if (!isIncluded) return false;

                let isExcluded = selectedExcludeLists.includes(\`contact-\${c.id}\`) ||
                                 (c.list_ids && c.list_ids.some((lid: string) => selectedExcludeLists.includes(lid)));

                if (isExcluded) return false;

                if (!contactSearchQuery) return true;`;

content = content.replace(oldLogic, newLogic);

fs.writeFileSync('src/app/dashboard/campaigns/create/page.tsx', content, 'utf-8');
console.log('Done.');
