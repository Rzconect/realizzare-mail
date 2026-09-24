const fs = require('fs');
let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

c = c.replace(
    'const { data: { session } } = await supabase.auth.getSession();',
    'const { data: { user } } = await supabase.auth.getUser();'
);

c = c.replace(
    /if \(session\?\.user\) \{/g,
    'if (user) {'
);

c = c.replace(
    /session\.user\./g,
    'user.'
);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed ContactNotes auth');
