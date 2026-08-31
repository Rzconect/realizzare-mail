
const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/contacts/[id]/page.tsx", "utf8");

content = content.replace(
  `.in("run_id", (flowRunsData || []).map(r => r.id));`,
  `.in("run_id", (flowRunsData || []).map((r: any) => r.id));`
);

fs.writeFileSync("src/app/dashboard/contacts/[id]/page.tsx", content, "utf8");
console.log("Fixed implicitly any type on r!");

