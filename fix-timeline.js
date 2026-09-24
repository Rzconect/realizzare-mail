const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const timelineTarget = `{profile.timeline.slice(0, 3).map((t: any, i: number) => (
                                  <div key={i} className="relative pl-4">`;
const timelineReplace = `{[
                                  ...(profile.timeline || []),
                                  ...(profile.purchases || []).map((p: any) => ({
                                    label: p.status === 'paid' ? "Compra Aprovada" : "Compra Pendente",
                                    details: \`Adquiriu '\${p.product_name}' - R$ \${Number(p.amount || 0).toFixed(2).replace('.', ',')}\`,
                                    timestamp: p.paid_at || p.created_at || new Date().toISOString()
                                  })),
                                  ...(profile.enrollments || []).map((e: any) => ({
                                    label: "Matrícula em Curso",
                                    details: \`Matriculado no curso '\${e.course_name}'\`,
                                    timestamp: e.enrolled_at || profile.created_at || new Date().toISOString()
                                  }))
                                ].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()).slice(0, 3).map((t: any, i: number) => (
                                  <div key={i} className="relative pl-4">`;

if (c.includes('{profile.timeline.slice(0, 3).map((t: any, i: number) => (')) {
  c = c.replace(timelineTarget, timelineReplace);
}

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Conversations timeline fixed');
