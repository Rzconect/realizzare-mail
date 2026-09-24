const fs = require('fs');

let c = fs.readFileSync('src/app/api/whatsapp/message/route.ts', 'utf8');

const target = `const response = await fetch(\`\${baseUrl}/chat/deleteMessage/\${instanceName}\`, {`;
const replacement = `
    const localOnly = searchParams.get("localOnly") === "true";
    if (!localOnly) {
      const response = await fetch(\`\${baseUrl}/chat/deleteMessage/\${instanceName}\`, {`;

const target2 = `const data = await response.json();`;
const replacement2 = `const data = await response.json();
    }`;

c = c.replace(target, replacement);
c = c.replace(target2, replacement2);

fs.writeFileSync('src/app/api/whatsapp/message/route.ts', c);
console.log('Added localOnly support');
