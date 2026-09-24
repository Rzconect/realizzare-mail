const fs = require('fs');

let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

c = c.replace(
  /const meta = session\.user\.user_metadata \|\| \{\};\s*if \(meta\.first_name\) \{[\s\S]*?\} else if \(session\.user\.email\) \{/g,
  `const meta = session.user.user_metadata || {};
        const name = meta.full_name || meta.name || (meta.first_name ? \`\${meta.first_name} \${meta.last_name || ""}\` : "");
        if (name) {
          const parts = name.trim().split(" ");
          if (parts.length > 1) {
            setUserInitials((parts[0].charAt(0) + parts[parts.length-1].charAt(0)).toUpperCase());
          } else {
            setUserInitials(parts[0].substring(0, 2).toUpperCase());
          }
          setUserName(name);
        } else if (session.user.email) {`
);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed user name parsing');
