const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(
  '<ContactNotes contactId={profile.id} />',
  '<ContactNotes contactId={(profile as any).id || linkedContacts[activeChat.id]} />'
);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed profile id error');
