const fs = require('fs');

let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

c = c.replace(
  'export default function ContactNotes({ contactId }: { contactId: string }) {',
  'export default function ContactNotes({ contactId, currentUser }: { contactId: string, currentUser?: { initials: string, name: string } }) {'
);

c = c.replace(
  'const [userInitials, setUserInitials] = useState("UX");',
  'const [userInitials, setUserInitials] = useState(currentUser?.initials || "UX");'
);

c = c.replace(
  'const [userName, setUserName] = useState("Usuário");',
  'const [userName, setUserName] = useState(currentUser?.name || "Usuário");'
);

// We can remove the local auth fetch inside ContactNotes to avoid race conditions
const regexAuth = /\/\/ Get current user for initials[\s\S]*?\/\/ Fetch notes/;
c = c.replace(regexAuth, `if (currentUser) {
        setUserInitials(currentUser.initials);
        setUserName(currentUser.name);
      }
      // Fetch notes`);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed ContactNotes to accept currentUser prop');
