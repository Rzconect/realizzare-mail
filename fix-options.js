const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/Apagar mensagem<\/button>/g, `Apagar mensagem</button>
        <button onClick={() => { setActiveMessageMenu(null); alert('Encaminhar ainda não implementado.'); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Encaminhar</button>
        <button onClick={() => { setActiveMessageMenu(null); alert('Editar ainda não implementado.'); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Editar</button>`);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Added more options');
