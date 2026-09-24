const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

c = c.replace(
  'const [activeTab, setActiveTab] = useState("info");',
  'const [activeTab, setActiveTab] = useState("info");\n  const [rightPanelTab, setRightPanelTab] = useState<"timeline" | "notes">("timeline");'
);

const oldBlockStart = `            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">
                <Clock className="h-4.5 w-4.5 text-indigo-650" />
                <span>Linha do Tempo</span>
              </h3>`;

const newBlockStart = `            <div className="space-y-6">
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
                <div className="space-y-6">`;

const oldBlockEnd = `                  <div className="pt-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fim do histórico ({draft.timeline.length} eventos)
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>`;

const newBlockEnd = `                  <div className="pt-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fim do histórico ({draft.timeline.length} eventos)
                  </div>
                )}
              </div>
              </div>
              )}
            </div>
          </div>
        </section>`;

if (!c.includes(oldBlockStart)) { console.log('START MISSING'); }
if (!c.includes(oldBlockEnd)) { console.log('END MISSING'); }

c = c.replace(oldBlockStart, newBlockStart);
c = c.replace(oldBlockEnd, newBlockEnd);

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Tabs correctly injected with div wrapper!');
