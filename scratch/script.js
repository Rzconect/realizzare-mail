
const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/campaigns/[id]/page.tsx", "utf8");

content = content.replace(
  `sent_count: 0`,
  `sent_count: 0, sent_at: null`
);

fs.writeFileSync("src/app/dashboard/campaigns/[id]/page.tsx", content, "utf8");
console.log("Fixed missing property in dbCamp!");

