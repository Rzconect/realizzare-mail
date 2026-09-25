const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/automations/page.tsx', 'utf8');

c = c.replace(/const \[cloneSelectedCourse, setCloneSelectedCourse\] = useState\("Todos os Cursos"\);\s*/g, '');
c = c.replace(/const \[showCloneCourseDropdown, setShowCloneCourseDropdown\] = useState\(false\);\s*/g, '');
c = c.replace(/const \[cloneSearchTerm, setCloneSearchTerm\] = useState\(""\);\s*/g, '');

fs.writeFileSync('src/app/dashboard/automations/page.tsx', c);
console.log('Removed unused states');
