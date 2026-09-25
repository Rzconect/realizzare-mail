const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

// Render msg.text properly with quotes
const regex1 = /<p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">\{msg\.text\}<\/p>/g;
const replacement1 = `{msg.isQuoted && (
  <div onClick={() => {
    const el = document.getElementById('msg-' + msg.quotedId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }} className="mb-2 p-2 rounded-lg text-xs border-l-4 cursor-pointer transition-colors bg-slate-200 border-slate-400 hover:bg-slate-300">
    <div className="font-bold mb-1 text-indigo-600">
      {msg.quotedParticipant?.includes(currentUser?.phone) || msg.quotedParticipant === '' ? 'Você' : 'Contato'}
    </div>
    <div className="text-slate-600 line-clamp-3 break-words">{msg.quotedText}</div>
  </div>
)}
<p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>`;
c = c.replace(regex1, replacement1);

const regex2 = /<p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">\{msg\.text\}<\/p>/g;
const replacement2 = `{msg.isQuoted && (
  <div onClick={() => {
    const el = document.getElementById('msg-' + msg.quotedId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }} className="mb-2 p-2 rounded-lg text-xs border-l-4 cursor-pointer transition-colors bg-emerald-700/20 border-emerald-900/50 hover:bg-emerald-700/30">
    <div className="font-bold mb-1 text-emerald-900">
      {msg.quotedParticipant?.includes(currentUser?.phone) || msg.quotedParticipant === '' ? 'Você' : 'Contato'}
    </div>
    <div className="text-slate-600 line-clamp-3 break-words">{msg.quotedText}</div>
  </div>
)}
<p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>`;
c = c.replace(regex2, replacement2);

// Fix msg.time for edit status
const regex3 = /<span className="text-\[9px\] font-semibold text-slate-400">\{msg\.time\}<\/span>/g;
const replacement3 = `<span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
  {msg.isEdited && <span className="italic">Editada</span>}
  {msg.time}
</span>`;
c = c.replace(regex3, replacement3);

const regex4 = /<span className=\{\`text-\[9px\] font-semibold \$\{isMine \? "text-emerald-700\/60" : "text-slate-400"\}\`\}>\{msg\.time\}<\/span>/g;
const replacement4 = `<span className={\`text-[9px] font-semibold flex items-center gap-1 \${isMine ? "text-emerald-700/60" : "text-slate-400"}\`}>
  {msg.isEdited && <span className="italic">Editada</span>}
  {msg.time}
</span>`;
c = c.replace(regex4, replacement4);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed UI rendering for quotes and edits');
