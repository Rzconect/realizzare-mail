const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const regex1 = /<section className="lg:col-span-4 lg:h-full lg:overflow-y-auto scrollbar-none p-1">\s*<div className="bg-white border border-slate-200 rounded-3xl px-4 py-6 shadow-sm flex flex-col justify-between my-0\.5">\s*<div className="space-y-6">\s*<h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">\s*<Clock className="h-4\.5 w-4\.5 text-indigo-650" \/>\s*<span>Linha do Tempo<\/span>\s*<\/h3>/;

const replacement1 = `<section className="lg:col-span-4 lg:h-full lg:overflow-y-auto scrollbar-none p-1">
          <div className="bg-white border border-slate-200 rounded-3xl px-4 py-4 shadow-sm flex flex-col justify-between my-0.5">
            <div className="space-y-4">
              
              {/* Tabs for Right Panel */}
              <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
                <button 
                  onClick={() => setRightPanelTab('timeline')}
                  className={\`text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-2 -mb-2.5 \${rightPanelTab === 'timeline' ? 'text-indigo-650 border-b-2 border-indigo-650' : 'text-slate-400 hover:text-slate-600'}\`}
                >
                  <Clock className="h-4 w-4" />
                  <span>Linha do Tempo</span>
                </button>
                <button 
                  onClick={() => setRightPanelTab('notes')}
                  className={\`text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-2 -mb-2.5 \${rightPanelTab === 'notes' ? 'text-indigo-650 border-b-2 border-indigo-650' : 'text-slate-400 hover:text-slate-600'}\`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Observações</span>
                </button>
              </div>

              {rightPanelTab === 'notes' && (
                <div className="h-[400px] lg:h-[calc(100vh-250px)]">
                  {draft?.id && <ContactNotes contactId={draft.id} />}
                </div>
              )}

              {rightPanelTab === 'timeline' && (
                <>
`;

c = c.replace(regex1, replacement1);

const regex2 = /\s*\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/;

const replacement2 = `
                  )}
                </div>
                </>
              )}
            </div>
          </div>
        </section>`;

c = c.replace(regex2, replacement2);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Fixed Tabs!');
