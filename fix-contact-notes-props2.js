const fs = require('fs');

let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');
// Revert it back first
c = c.replace(`if (currentUser) {
        setUserInitials(currentUser.initials);
        setUserName(currentUser.name);
      }
      // Fetch notes`, `// Get current user for initials
      if (currentUser) {
        setUserInitials(currentUser.initials);
        setUserName(currentUser.name);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata || {};
          const name = meta.full_name || meta.name || (meta.first_name ? \`\${meta.first_name} \${meta.last_name || ""}\` : "");
          if (name) {
            const parts = name.trim().split(" ");
            if (parts.length > 1) {
              setUserInitials((parts[0].charAt(0) + parts[parts.length-1].charAt(0)).toUpperCase());
            } else {
              setUserInitials(parts[0].substring(0, 2).toUpperCase());
            }
            setUserName(name);
          } else if (user.email) {
            setUserInitials(user.email.substring(0, 2).toUpperCase());
            setUserName(user.email.split("@")[0]);
          }
        }
      }

      // Fetch notes`);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Restored fallback auth in ContactNotes');
