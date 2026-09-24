const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

if (!c.includes('import ContactNotes')) {
  c = c.replace('import { createClient } from "@/lib/supabase/client";', 'import { createClient } from "@/lib/supabase/client";\nimport ContactNotes from "@/components/crm/ContactNotes";\nimport { FileText } from "lucide-react";');
}

// Add 'notes: true' to the initial state of openSections if not there
if (!c.includes("const [openSections, setOpenSections] = useState<Record<string, boolean>>({ notes: true });")) {
  c = c.replace("const [openSections, setOpenSections] = useState<Record<string, boolean>>({});", "const [openSections, setOpenSections] = useState<Record<string, boolean>>({ notes: true });");
}

const target = `</p>
                            )}
                          )}
                        </div>`;

const replacement = `</p>
                            )}
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <button onClick={() => toggleSection('notes')} className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 cursor-pointer hover:text-indigo-600 transition-colors">
                            <div className="flex items-center gap-1"><FileText className="h-4 w-4 text-slate-400" /> Observações</div>
                            <ChevronDown className={\`h-4 w-4 transition-transform \${openSections.notes ? 'rotate-180' : ''}\`} />
                          </button>
                          {openSections.notes && (
                            <div className="h-[300px]">
                              <ContactNotes contactId={profile.id} />
                            </div>
                          )}
                        </div>`;

if (c.includes(target) && !c.includes('<ContactNotes')) {
  c = c.replace(target, replacement);
}

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Conversations notes updated');
