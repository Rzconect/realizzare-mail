const fs = require('fs');
const path = 'src/app/dashboard/campaigns/create/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const assuntoLabel = '<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Assunto do E-mail <span className="text-red-500">*</span></label>';
const assuntoReplacement = `<div className="flex justify-between items-center">
  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Assunto do E-mail <span className="text-red-500">*</span></label>
  <span className="text-[10px] font-semibold text-slate-400">
    <span className={subjectLine.length > 60 ? "text-orange-500" : ""}>{subjectLine.length}</span> / 60 (Desktop) / 35 (Mobile)
  </span>
</div>`;

const preheaderLabel = '<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pré-cabeçalho <span className="text-red-500">*</span></label>';
const preheaderReplacement = `<div className="flex justify-between items-center">
  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pré-cabeçalho <span className="text-red-500">*</span></label>
  <span className="text-[10px] font-semibold text-slate-400">
    <span className={preheader.length > 80 ? "text-orange-500" : ""}>{preheader.length}</span> / 80 (Desktop) / 40 (Mobile)
  </span>
</div>`;

content = content.replace(assuntoLabel, assuntoReplacement);
content = content.replace(preheaderLabel, preheaderReplacement);

fs.writeFileSync(path, content, 'utf8');
console.log('done');