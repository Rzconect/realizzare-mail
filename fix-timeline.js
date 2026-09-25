const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const regex = /(\/\/ Deduplicate and sort[\s\S]*?timestamp: e\.timestamp\s+\}\)\);)/;

const match = c.match(regex);
if (match) {
  let modified = c.replace(match[0], ''); // remove from original position
  
  // place it right before profileObj
  const profileObjPos = modified.indexOf('const profileObj = {');
  modified = modified.slice(0, profileObjPos) + match[0] + '\n\n        ' + modified.slice(profileObjPos);
  
  fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', modified);
  console.log('Fixed timeline ordering');
} else {
  console.log('Regex match failed');
}
