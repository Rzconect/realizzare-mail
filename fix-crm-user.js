const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

c = c.replace('const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);', 'const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);\n  const [currentUser, setCurrentUser] = useState<any>(null);');

const target1 = `if (profile) me = profile;
          }
        }`;

const replacement1 = `if (profile) me = profile;
          }
        }
        if (me) {
           let n = me.name || me.full_name || me.first_name || "";
           let i = "UX";
           if (n) {
             const pts = n.trim().split(" ");
             if(pts.length > 1) i = (pts[0].charAt(0) + pts[pts.length-1].charAt(0)).toUpperCase();
             else i = pts[0].substring(0, 2).toUpperCase();
           } else if (me.email) {
             i = me.email.substring(0, 2).toUpperCase();
           }
           setCurrentUser({ name: n, initials: i });
        }`;

c = c.replace(target1, replacement1);

c = c.replace('<DealModal \n        isOpen={isModalOpen}', '<DealModal \n        currentUser={currentUser}\n        isOpen={isModalOpen}');

fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
console.log('Fixed crm/page.tsx');
