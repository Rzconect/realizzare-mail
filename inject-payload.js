const fs = require('fs');

let c1 = fs.readFileSync('src/app/api/v1/client-events/route.ts', 'utf8');
let c2 = fs.readFileSync('src/app/api/v1/realizzare-events/route.ts', 'utf8');

c1 = c1.replace(/await triggerFlowsForEvent\(supabase, "Curso Iniciado \(course\.progress \- Inicio\)", contactId\);/g, 'await triggerFlowsForEvent(supabase, "Curso Iniciado (course.progress - Inicio)", contactId, { course_name: courseName || "" });');
c1 = c1.replace(/await triggerFlowsForEvent\(supabase, "Curso em Andamento 50% \(course\.progress \- Meio\)", contactId\);/g, 'await triggerFlowsForEvent(supabase, "Curso em Andamento 50% (course.progress - Meio)", contactId, { course_name: courseName || "" });');
c1 = c1.replace(/await triggerFlowsForEvent\(supabase, "Curso Concluído 100% \(course\.progress \- Fim\)", contactId\);/g, 'await triggerFlowsForEvent(supabase, "Curso Concluído 100% (course.progress - Fim)", contactId, { course_name: courseName || "" });');

c2 = c2.replace(/await triggerFlowsForEvent\(supabase, "Contato Criado \/ Atualizado", contact\.id\);/g, 'await triggerFlowsForEvent(supabase, "Contato Criado / Atualizado", contact.id, {});');
c2 = c2.replace(/await triggerFlowsForEvent\(supabase, "Matrícula Realizada", contact\.id\);/g, 'await triggerFlowsForEvent(supabase, "Matrícula Realizada", contact.id, { course_name: courseName || "" });');

fs.writeFileSync('src/app/api/v1/client-events/route.ts', c1);
fs.writeFileSync('src/app/api/v1/realizzare-events/route.ts', c2);
console.log('Modified routes to pass payload cleanly');
