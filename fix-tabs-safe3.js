const fs = require('fs');

let lines = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8').split(/\r?\n/);

let topIdx = lines.findIndex(l => l.includes('<Clock className="h-4.5 w-4.5 text-indigo-650" />'));
if (topIdx === -1) {
    console.log("Could not find Clock icon!");
    process.exit(1);
}

// Remove the old title
lines.splice(topIdx, 2);

lines.splice(topIdx, 0, 
    '              {/* Tabs for Right Panel */}',
    '              <div className="flex items-center gap-4 border-b border-slate-200 pb-2">',
    '                <button type="button" onClick={() => setRightPanelTab(\'timeline\')} className={\`text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-2 -mb-2.5 \${rightPanelTab === \'timeline\' ? \'text-indigo-650 border-b-2 border-indigo-650\' : \'text-slate-400 hover:text-slate-600\'}\`}>',
    '                  <Clock className="h-4 w-4" />',
    '                  <span>Linha do Tempo</span>',
    '                </button>',
    '                <button type="button" onClick={() => setRightPanelTab(\'notes\')} className={\`text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-2 -mb-2.5 \${rightPanelTab === \'notes\' ? \'text-indigo-650 border-b-2 border-indigo-650\' : \'text-slate-400 hover:text-slate-600\'}\`}>',
    '                  <FileText className="h-4 w-4" />',
    '                  <span>Observações</span>',
    '                </button>',
    '              </div>',
    '              {rightPanelTab === \'notes\' && (',
    '                <div className="h-[400px] lg:h-[calc(100vh-250px)]">',
    '                  {draft?.id && <ContactNotes contactId={draft.id} />}',
    '                </div>',
    '              )}',
    '              {rightPanelTab === \'timeline\' && (<>'
);

let bottomIdx = lines.findIndex(l => l.includes('Fim do hist'));
if (bottomIdx === -1) {
    console.log("Could not find Fim do histórico!");
    process.exit(1);
}

// Insert right after the onScroll div closing
lines.splice(bottomIdx+4, 0, 
    '              </>',
    '              )}'
);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', lines.join('\n'));
console.log('Successfully injected tabs via Splice at idx+4!');
