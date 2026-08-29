const fs = require('fs');
const path = 'src/app/dashboard/campaigns/create/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const searchStr = '{/* Device Wrapper */}\n        <div className={`transition-all bg-white relative flex flex-col mx-auto ${';
const replaceStr = '{/* Device Wrapper */}\n        <div style={{ zoom: device === \"mobile\" ? 0.75 : 1 }} className={`transition-all bg-white relative flex flex-col mx-auto ${';

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(path, content, 'utf8');
console.log('done');