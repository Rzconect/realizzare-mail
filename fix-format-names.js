const fs = require('fs');

function injectFormatter(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  if (!c.includes('function formatContactFullName')) {
    const formatter = `\nfunction formatContactFullName(firstStr: string, lastStr: string): string {
  let combined = \`\${firstStr || ""} \${lastStr || ""}\`.trim();
  if (!combined) return "Contato Sem Nome";
  combined = combined.replace(/[._-]/g, " ");
  return combined.split(/\\s+/).filter(Boolean).map(word => {
    const lower = word.toLowerCase();
    if (["da", "de", "do", "das", "dos", "e"].includes(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(" ");
}\n`;
    // Insert after imports
    const idx = c.indexOf('\n\n');
    c = c.slice(0, idx) + formatter + c.slice(idx);
  }
  return c;
}

// 1. Conversations
let conv = injectFormatter('src/app/dashboard/conversations/page.tsx');

// In localProfile match
conv = conv.replace(
  /first_name: match.first_name \|\| "",\s*last_name: match.last_name \|\| "",/g,
  `first_name: formatContactFullName(match.first_name || "", match.last_name || "").split(" ")[0] || "",
            last_name: formatContactFullName(match.first_name || "", match.last_name || "").split(" ").slice(1).join(" ") || "",`
);

// In data match
conv = conv.replace(
  /first_name: data.first_name \|\| "",\s*last_name: data.last_name \|\| "",/g,
  `first_name: formatContactFullName(data.first_name || "", data.last_name || "").split(" ")[0] || "",
            last_name: formatContactFullName(data.first_name || "", data.last_name || "").split(" ").slice(1).join(" ") || "",`
);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', conv);

// 2. Contact Details [id]/page.tsx
let det = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');
if (!det.includes('function formatContactFullName')) {
    det = injectFormatter('src/app/dashboard/contacts/[id]/page.tsx');
}

det = det.replace(
  /first_name: contact\.first_name \|\| "",\s*last_name: contact\.last_name \|\| "",/g,
  `first_name: formatContactFullName(contact.first_name || "", contact.last_name || "").split(" ")[0] || "",
          last_name: formatContactFullName(contact.first_name || "", contact.last_name || "").split(" ").slice(1).join(" ") || "",`
);

det = det.replace(
  /first_name: c\?\.first_name \|\| "",\s*last_name: c\?\.last_name \|\| "",/g,
  `first_name: formatContactFullName(c?.first_name || "", c?.last_name || "").split(" ")[0] || "",
          last_name: formatContactFullName(c?.first_name || "", c?.last_name || "").split(" ").slice(1).join(" ") || "",`
);

// Format draft when loading
det = det.replace(
  /const fallbackProfileObj = {\s*first_name,\s*last_name,/g,
  `const fallbackProfileObj = {
          first_name: formatContactFullName(first_name, last_name).split(" ")[0] || "",
          last_name: formatContactFullName(first_name, last_name).split(" ").slice(1).join(" ") || "",`
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', det);

console.log('Done');
