
const fs = require("fs");
let content = fs.readFileSync("src/components/FlowCanvas.tsx", "utf8");

const targetStr = `                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                                Assunto: "{tpl.subject}"
                              </p>
                            </div>`;

const replacement = `                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                                Assunto: "{tpl.subject}"
                              </p>
                            </div>
                            
                            <div className="mt-3 mb-1 h-32 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 relative group-hover/card:border-indigo-200 transition-colors">
                              {tpl.htmlContent ? (
                                <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none p-4">
                                  <div dangerouslySetInnerHTML={{ __html: tpl.htmlContent }} />
                                </div>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                  <FileText className="h-6 w-6 mb-1 opacity-50" />
                                  <span className="text-[10px] font-medium">Sem prévia visual</span>
                                </div>
                              )}
                            </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync("src/components/FlowCanvas.tsx", content, "utf8");
  console.log("Added template preview to gallery!");
} else {
  console.log("Could not find the target string.");
}

