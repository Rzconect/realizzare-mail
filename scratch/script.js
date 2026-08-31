
const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");

content = content.replace(
  `setRecentEventsList(filteredPeriodEvents.slice(0, 15));`,
  `setRecentEventsList(filteredPeriodEvents);`
);

const oldFilter = `const filteredEventsList = recentEventsList.filter((evt) => {
    if (eventsTypeFilter === "email" && evt.type === "purchase") return false;
    if (eventsTypeFilter === "purchase" && evt.type !== "purchase") return false;
    if (!eventsSearchTerm.trim()) return true;
    const term = eventsSearchTerm.toLowerCase().trim();
    return (
      (evt.name || "").toLowerCase().includes(term) ||
      (evt.email || "").toLowerCase().includes(term) ||
      (evt.itemTitle || evt.eventLabel || "").toLowerCase().includes(term)
    );
  });`;

const newFilter = `const filteredEventsList = recentEventsList.filter((evt) => {
    if (eventsTypeFilter === "email" && evt.type === "purchase") return false;
    if (eventsTypeFilter === "purchase" && evt.type !== "purchase") return false;
    if (!eventsSearchTerm.trim()) return true;
    const term = eventsSearchTerm.toLowerCase().trim();
    return (
      (evt.name || "").toLowerCase().includes(term) ||
      (evt.email || "").toLowerCase().includes(term) ||
      (evt.itemTitle || evt.eventLabel || "").toLowerCase().includes(term)
    );
  }).slice(0, 15);`;

content = content.replace(oldFilter, newFilter);

fs.writeFileSync("src/app/dashboard/page.tsx", content, "utf8");
console.log("Fixed dashboard event filtering logic!");

