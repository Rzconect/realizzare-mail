
const fs = require("fs");
let content = fs.readFileSync("src/components/FlowCanvas.tsx", "utf8");

const regex = /\{\/\* Gallery Grid \*\/\}[\s\S]*?\{\/\* MODAL: CONFIRM MOVE LEADS \*\/\}/g;

const replacement = `{/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
              {(() => {
                const filtered = galleryTemplates.filter((t) => {
                  const q = gallerySearchQuery.toLowerCase();
                  return (
                    !q ||
                    t.name?.toLowerCase().includes(q) ||
                    t.subject?.toLowerCase().includes(q) ||
                    t.folderName?.toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return <div className="text-center text-sm text-slate-500 py-10">Nenhum template encontrado.</div>;
                }

                // Group by folderName
                const grouped = filtered.reduce((acc, tpl) => {
                  const fName = tpl.folderName || "Galeria Geral";
                  if (!acc[fName]) acc[fName] = [];
                  acc[fName].push(tpl);
                  return acc;
                }, {});

                // Sort keys so currentFlowName is always first!
                const keys = Object.keys(grouped).sort((a, b) => {
                  if (a === flow.name) return -1;
                  if (b === flow.name) return 1;
                  return a.localeCompare(b);
                });

                return keys.map((folderName) => {
                  const templates = grouped[folderName];
                  return (
                    <details key={folderName} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs" open={folderName === flow.name || gallerySearchQuery.length > 0}>
                      <summary className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 cursor-pointer select-none transition-colors">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm font-bold text-slate-800">{folderName}</span>
                          <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 rounded-full">{templates.length}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 bg-slate-50/20">
                        {templates.map((tpl) => (
                          <div
                            key={tpl.id}
                            className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all flex flex-col justify-between group/card"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1.5">
                                <span className="uppercase text-slate-400">{tpl.status}</span>
                              </div>
                              <h4 className="font-extrabold text-slate-850 text-sm group-hover/card:text-indigo-600 transition-colors truncate">
                                {tpl.name}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                                Assunto: "{tpl.subject}"
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectTemplateFromGallery(tpl)}
                              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Usar este Template</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </details>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM MOVE LEADS */}`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync("src/components/FlowCanvas.tsx", content, "utf8");
  console.log("Updated FlowCanvas gallery templates via regex!");
} else {
  console.log("Could not find regex for gallery templates block");
}

