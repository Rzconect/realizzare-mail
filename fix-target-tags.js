const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(/tags \(\s*name\s*\)/, 'tags (\n              id,\n              name\n            )');

c = c.replace(
  /if \(!isTargeted && contact\.list_subscriptions\) \{/,
  `if (!isTargeted && contact.contact_tags) {
                contact.contact_tags.forEach((ct: any) => {
                  if (ct.tags?.id && targetStr.includes(ct.tags.id.toLowerCase())) isTargeted = true;
                  if (ct.tags?.name && targetStr.includes(ct.tags.name.toLowerCase())) isTargeted = true;
                });
              }
              if (!isTargeted && contact.list_subscriptions) {`
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed tags targeting check');
