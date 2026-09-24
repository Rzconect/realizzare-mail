const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

if (!c.includes('import ContactNotes')) {
  c = c.replace('import { createClient } from "@/lib/supabase/client";', 'import { createClient } from "@/lib/supabase/client";\nimport ContactNotes from "@/components/crm/ContactNotes";');
}

const target = `<section className="lg:col-span-4 lg:h-full lg:overflow-y-auto scrollbar-none p-1">
          <div className="bg-white border border-slate-200 rounded-3xl px-4 py-6 shadow-sm flex flex-col justify-between min-h-full my-0.5">`;

const replacement = `<section className="lg:col-span-4 lg:h-full lg:overflow-y-auto scrollbar-none p-1 space-y-3">
          
          <div className="bg-white border border-slate-200 rounded-3xl px-4 py-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
              <FileText className="h-4.5 w-4.5 text-indigo-650" />
              <span>Observações do Contato</span>
            </h3>
            <div className="h-[300px]">
              {draft?.id && <ContactNotes contactId={draft.id} />}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl px-4 py-6 shadow-sm flex flex-col justify-between my-0.5">`;

c = c.replace(target, replacement);

// fix height class if needed
c = c.replace('min-h-full my-0.5', 'my-0.5');

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Added ContactNotes to contact profile');
