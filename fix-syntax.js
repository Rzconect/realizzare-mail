const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(
  '{openSections.cursos && (\n                          {profile.enrollments',
  '{openSections.cursos && (\n                          <>\n                          {profile.enrollments'
);
c = c.replace(
  /Nenhuma matrícula encontrada\.<\/p>\s*\}\)\s*<\/div>/,
  'Nenhuma matrícula encontrada.</p>\n                          )}\n                          </>\n                          )}\n                        </div>'
);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed syntax error');
