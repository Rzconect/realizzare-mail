const fs = require('fs');

let c = fs.readFileSync('src/components/crm/DealModal.tsx', 'utf8');

c = c.replace(
  '<div className="py-3 flex flex-col flex-1 min-h-[250px]">',
  '<div className="py-3 flex flex-col">'
);

c = c.replace(
  '<div className="py-3 flex flex-col flex-1 min-h-[350px]">',
  '<div className="py-3 flex flex-col mt-2">'
);

// also remove h-[300px] from the container of ContactNotes because ContactNotes handles its own layout, wait ContactNotes has flex flex-col h-full internally! If we remove h-[300px], ContactNotes might collapse. Let's keep h-[300px] on the wrapper.
c = c.replace(
  '<div className="flex-1 bg-slate-100/50 rounded-xl border border-slate-200 p-3 h-[300px]">',
  '<div className="bg-slate-100/50 rounded-xl border border-slate-200 p-3 h-[300px]">'
);

fs.writeFileSync('src/components/crm/DealModal.tsx', c);
console.log('Fixed DealModal layout');
