const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(/lists \(\s*name\s*\)/, 'lists (\n              id,\n              name\n            )');

c = c.replace(
  /const targetStr = \(c\.target_list \|\| ""\)\.toLowerCase\(\);\s*const isTargeted = targetStr\.includes\(contactEmailLower\);/,
  `const targetStr = (c.target_list || "").toLowerCase();
              let isTargeted = targetStr.includes(contactEmailLower);
              if (!isTargeted && contact.list_subscriptions) {
                contact.list_subscriptions.forEach((ls: any) => {
                  if (ls.status === "subscribed") {
                    if (ls.lists?.id && targetStr.includes(ls.lists.id.toLowerCase())) isTargeted = true;
                    if (ls.lists?.name && targetStr.includes(ls.lists.name.toLowerCase())) isTargeted = true;
                  }
                });
              }`
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed campaign targeting check');
