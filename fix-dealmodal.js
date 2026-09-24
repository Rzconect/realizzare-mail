const fs = require('fs');
let c = fs.readFileSync('src/components/crm/DealModal.tsx', 'utf8');

if (!c.includes('import ContactNotes')) {
  c = c.replace('import { createClient } from "@/lib/supabase/client";', 'import { createClient } from "@/lib/supabase/client";\nimport ContactNotes from "./ContactNotes";\nimport { FileText } from "lucide-react";');
}

const target = `</>
          )}
          
        </div>`;

const replacement = `
                <div className="border-b border-slate-200/80 my-2"></div>
                <div className="py-3 flex flex-col flex-1 min-h-[350px]">
                  <div className="flex items-center gap-2 text-slate-500 mb-4">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Observações</span>
                  </div>
                  <div className="flex-1 bg-slate-100/50 rounded-xl border border-slate-200 p-3 h-[300px]">
                    <ContactNotes contactId={deal.contactId} />
                  </div>
                </div>
</>
          )}
          
        </div>`;

c = c.replace(target, replacement);

fs.writeFileSync('src/components/crm/DealModal.tsx', c);
console.log('DealModal updated');
