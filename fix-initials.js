const fs = require('fs');

let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

c = c.replace(
  /const \{ data: profile \} = await supabase\.from\('users'\)\.select\('first_name, last_name, email'\)\.eq\('id', session\.user\.id\)\.single\(\);\s*if \(profile\) \{\s*const fn = profile\.first_name \|\| "";\s*const ln = profile\.last_name \|\| "";\s*if \(fn \|\| ln\) \{\s*setUserInitials\(\(fn\.charAt\(0\) \+ ln\.charAt\(0\)\)\.toUpperCase\(\)\);\s*\} else if \(profile\.email\) \{\s*setUserInitials\(profile\.email\.substring\(0, 2\)\.toUpperCase\(\)\);\s*\}\s*\}/g,
  `const meta = session.user.user_metadata || {};
        if (meta.first_name) {
          setUserInitials((meta.first_name.charAt(0) + (meta.last_name || "").charAt(0)).toUpperCase());
        } else if (session.user.email) {
          setUserInitials(session.user.email.substring(0, 2).toUpperCase());
        }`
);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed initials logic');
