
const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/campaigns/[id]/page.tsx", "utf8");

content = content.replace(/\(n\) =>/g, "(n: any) =>");
content = content.replace(/\(te\) =>/g, "(te: any) =>");
content = content.replace(/\(l\) =>/g, "(l: any) =>");
content = content.replace(/\(c\) =>/g, "(c: any) =>");
content = content.replace(/\(pe\) =>/g, "(pe: any) =>");
content = content.replace(/\(r\) =>/g, "(r: any) =>");
content = content.replace(/\(acc, r\) =>/g, "(acc: any, r: any) =>");

fs.writeFileSync("src/app/dashboard/campaigns/[id]/page.tsx", content, "utf8");
console.log("Fixed implicitly any in campaigns page!");

