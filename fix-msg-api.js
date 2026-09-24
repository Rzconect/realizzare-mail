const fs = require('fs');
let c = fs.readFileSync('src/app/api/whatsapp/message/route.ts', 'utf8');

c = c.replace(/const instanceName = .*/, 'const instanceName = "RealizzareCRM";');
c = c.replace(/const baseUrl = .*/, 'const baseUrl = "https://evolution-api-production-8158.up.railway.app";');
c = c.replace(/const apiKey = .*/, 'const apiKey = "RealizzareSenhaSecreta2026";');

fs.writeFileSync('src/app/api/whatsapp/message/route.ts', c);
console.log('Fixed API vars');
