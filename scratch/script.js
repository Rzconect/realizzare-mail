
const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");

content = content.replace("if (eventsJson.data) eventsData = eventsJson.data;", "if (eventsJson.eventsData) eventsData = eventsJson.eventsData;");

fs.writeFileSync("src/app/dashboard/page.tsx", content, "utf8");
console.log("Fixed eventsData assignment!");

