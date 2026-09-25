const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(
  /<Unlink className="h-4 w-4 text-red-400 hover:text-red-600 cursor-pointer transition-colors" \/>\s*<\/button><\/div>/,
  `<Unlink className="h-4 w-4 text-red-400 hover:text-red-600 cursor-pointer transition-colors" />
                </button>
                <button title="Configurar Painel" onClick={() => setIsPanelConfigOpen(true)}>
                  <Settings className="h-4 w-4 text-slate-400 hover:text-indigo-600 transition-colors" />
                </button>
              </div>`
);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Added gear icon');
