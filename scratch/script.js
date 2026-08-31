
const fs = require("fs");
let content = fs.readFileSync("src/components/FlowCanvas.tsx", "utf8");

content = content.replace(/galleryTemplates\.filter\(\(t\)/g, "galleryTemplates.filter((t: any)");
content = content.replace(/filtered\.reduce\(\(acc, tpl\)/g, "filtered.reduce((acc: any, tpl: any)");
content = content.replace(/keys\.map\(\(folderName\)/g, "keys.map((folderName: string)");
content = content.replace(/templates\.map\(\(tpl\)/g, "templates.map((tpl: any)");

fs.writeFileSync("src/components/FlowCanvas.tsx", content, "utf8");
console.log("Fixed implicitly any in FlowCanvas!");

