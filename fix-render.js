const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/automations/page.tsx', 'utf8');

c = c.replace(
  '{filteredFlows.length > 0 ? (',
  `{isLoading ? (
    <tr><td colSpan={7} className="py-12 text-center text-slate-500">
      <div className="flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Carregando automações...</p>
      </div>
    </td></tr>
  ) : filteredFlows.length > 0 ? (`
);

fs.writeFileSync('src/app/dashboard/automations/page.tsx', c);
console.log('Fixed render logic via file');
