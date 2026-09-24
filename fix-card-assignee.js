const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

const replacement = `                              case 'assignedTo':
                                const assigneeName = deal.assignedTo || 'Sem responsável';
                                const assigneeInitials = assigneeName === 'Sem responsável' 
                                  ? 'SR' 
                                  : assigneeName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
                                return (
                                  <div key={field.id} className="flex items-center gap-1.5 pt-0.5 mt-1">
                                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-500 bg-slate-100 shrink-0 border border-slate-200">
                                      {assigneeInitials}
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 truncate">
                                      {assigneeName}
                                    </span>
                                  </div>
                                );`;

const atividadesTarget = `                              case 'assignedTo':
                                return (
                                  <div key={field.id} className="flex items-center gap-2 pt-1">
                                    <span className="text-[10px] font-semibold text-slate-500">
                                      Resp: <span className="font-bold text-slate-700">{deal.assignedTo || 'Sem responsável'}</span>
                                    </span>
                                  </div>
                                );`;

const dynamicTarget = `                              case 'assignedTo':
                                return (
                                  <div key={field.id} className="text-[10px] font-semibold text-slate-500">
                                    Resp: <span className="text-slate-700">{deal.assignedTo || 'Sem responsável'}</span>
                                  </div>
                                );`;

let replaced = false;
if (c.includes(atividadesTarget)) {
  c = c.replace(atividadesTarget, replacement);
  replaced = true;
} else {
  console.log('atividadesTarget not found');
}

if (c.includes(dynamicTarget)) {
  c = c.replace(dynamicTarget, replacement);
  replaced = true;
} else {
  console.log('dynamicTarget not found');
}

if (replaced) {
  fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
  console.log('done');
}
