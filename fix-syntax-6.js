const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(
  /<\/div>\n\n\s*<\/>\n\s*\);\n\s*\}\)\(\)/g,
  '</div>\n                      </div>\n                    </>\n                  );\n                })()'
);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed syntax 6');
