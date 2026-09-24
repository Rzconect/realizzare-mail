const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(
  'const [openSections, setOpenSections] = useState<Record<string, boolean>>({ notes: true });',
  'const [openSections, setOpenSections] = useState<Record<string, boolean>>({ notes: true });\n  const toggleSection = (sec: string) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));'
);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed toggleSection');
