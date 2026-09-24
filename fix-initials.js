const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

const target1 = `{u.name.substring(0, 2).toUpperCase()}`;
const target2 = `{user.name.substring(0, 2).toUpperCase()}`;

c = c.replace(target1, `{u.name ? (u.name.split(" ").length > 1 ? u.name.split(" ")[0][0] + u.name.split(" ")[u.name.split(" ").length - 1][0] : u.name.substring(0, 2)).toUpperCase() : "CO"}`);
c = c.replace(target2, `{user.name ? (user.name.split(" ").length > 1 ? user.name.split(" ")[0][0] + user.name.split(" ")[user.name.split(" ").length - 1][0] : user.name.substring(0, 2)).toUpperCase() : "CO"}`);

fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
console.log('done');
