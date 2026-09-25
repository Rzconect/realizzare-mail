const fs = require('fs');
let c = fs.readFileSync('src/app/api/v1/client-events/route.ts', 'utf8');

if (!c.includes('import { triggerFlowsForEvent }')) {
  c = c.replace('import { createClient } from "@supabase/supabase-js";', 'import { createClient } from "@supabase/supabase-js";\nimport { triggerFlowsForEvent } from "@/lib/flows/trigger";');
}

c = c.replace(
  'status: progressPercent >= 100 ? "completed" : "active"',
  'status: progressPercent >= 100 ? "completed" : "active"'
); // Just making sure we can inject logic around here.

const injectPoint = `await supabase.from("course_events").insert({`;
const newBlock = `
          if (progressPercent === 0) {
            await triggerFlowsForEvent(supabase, "Curso Iniciado (course.progress - Inicio)", contactId);
          } else if (progressPercent === 50) {
            await triggerFlowsForEvent(supabase, "Curso em Andamento 50% (course.progress - Meio)", contactId);
          } else if (progressPercent === 100) {
            await triggerFlowsForEvent(supabase, "Curso Concluído 100% (course.progress - Fim)", contactId);
          }
          
          await supabase.from("course_events").insert({`;

if (!c.includes('triggerFlowsForEvent(supabase, "Curso Iniciado')) {
    c = c.replace(injectPoint, newBlock);
}

fs.writeFileSync('src/app/api/v1/client-events/route.ts', c);
console.log('Injected in client-events');
