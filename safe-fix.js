const fs = require('fs');

const path = 'src/app/dashboard/conversations/page.tsx';
let c = fs.readFileSync(path, 'utf8');

// Fix timeline
c = c.replace(/<p className="text-xs font-medium text-slate-700">\{t\.action\}<\/p>/g,
  '<span className="text-xs font-bold text-slate-700 block leading-tight">{t.label}</span>\n                                            <span className="text-[10px] text-slate-500 block leading-tight mt-1">{t.details}</span>');

// Fix cursos
c = c.replace(/\{\(profile as any\)\.cursos/g, '{(profile as any).enrollments');
c = c.replace(/\{c\.nome\}/g, '{c.course_name}');
c = c.replace(/\{c\.progresso/g, '{c.progress');

// Fix transacoes
c = c.replace(/\{\(profile as any\)\.transacoes/g, '{(profile as any).purchases');
c = c.replace(/\{t\.produto\}/g, '{t.product_name}');
c = c.replace(/\{t\.data\}/g, '{formatTransactionDate(t.paid_at, t.product_type)}');
c = c.replace(/\{t\.valor\}/g, '{(t.amount / 100).toFixed(2).replace(\'.\', \',\')}');

fs.writeFileSync(path, c);
console.log('Safe fix applied');
