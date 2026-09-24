const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

if (!c.includes('const [currentUser')) {
    c = c.replace('const [activeTab, setActiveTab] = useState("info");', 
    'const [activeTab, setActiveTab] = useState("info");\n  const [currentUser, setCurrentUser] = useState<any>(null);\n  useEffect(() => {\n    supabase.auth.getUser().then(({data:{user}}) => { if(user) setCurrentUser({ id: user.id, name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] }) });\n  }, []);');
}

c = c.replace(/<ContactNotes contactId=\{draft\.id\} \/>/g, `<ContactNotes contactId={draft.id} currentUser={currentUser ? { name: currentUser.name, initials: currentUser.name.split(" ").length > 1 ? (currentUser.name.split(" ")[0][0] + currentUser.name.split(" ")[currentUser.name.split(" ").length-1][0]).toUpperCase() : currentUser.name.substring(0,2).toUpperCase() } : undefined} />`);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed ContactNotes in Contacts Profile');
