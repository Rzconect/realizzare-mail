const fs = require('fs');
let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

if (!c.includes('import { Send, User as UserIcon, Loader2, Trash2, Edit2 }')) {
  c = c.replace('import { Send, User as UserIcon, Loader2 } from "lucide-react";', 'import { Send, User as UserIcon, Loader2, Trash2, Edit2, X, Check } from "lucide-react";');
}

// Add author_name to Note interface
c = c.replace('author_initials: string;', 'author_initials: string;\n  author_name?: string;');

// Add editing state
c = c.replace('const [userInitials, setUserInitials] = useState("UX");', 'const [userInitials, setUserInitials] = useState("UX");\n  const [userName, setUserName] = useState("Usuário");\n  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);\n  const [editContent, setEditContent] = useState("");');

// Add userName to init function
c = c.replace(
  'setUserInitials((meta.first_name.charAt(0) + (meta.last_name || "").charAt(0)).toUpperCase());',
  'setUserInitials((meta.first_name.charAt(0) + (meta.last_name || "").charAt(0)).toUpperCase());\n          setUserName(`${meta.first_name} ${meta.last_name || ""}`.trim());'
);
c = c.replace(
  'setUserInitials(session.user.email.substring(0, 2).toUpperCase());',
  'setUserInitials(session.user.email.substring(0, 2).toUpperCase());\n          setUserName(session.user.email.split("@")[0]);'
);

// Modify handleSaveNote to include author_name
c = c.replace(
  'author_initials: userInitials,',
  'author_initials: userInitials,\n        author_name: userName,'
);

// Add edit/delete handlers
c = c.replace(
  'const handleSaveNote = async () => {',
  `const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta observação?")) return;
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    const supabase = createClient();
    await supabase.from("contact_custom_values").upsert({
      contact_id: contactId,
      field_id: NOTES_FIELD_ID,
      value_text: JSON.stringify(updatedNotes)
    }, { onConflict: "contact_id,field_id" });
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    const updatedNotes = notes.map(n => n.id === noteId ? { ...n, content: editContent } : n);
    setNotes(updatedNotes);
    setEditingNoteId(null);
    const supabase = createClient();
    await supabase.from("contact_custom_values").upsert({
      contact_id: contactId,
      field_id: NOTES_FIELD_ID,
      value_text: JSON.stringify(updatedNotes)
    }, { onConflict: "contact_id,field_id" });
  };

  const handleSaveNote = async () => {`
);

// Replace notes.map
const notesMapTarget = /notes\.map\(note => \([\s\S]*?<\/p>\s*<\/div>\s*<\/div>\s*\)\)/;
const notesMapReplace = `notes.map(note => (
                <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex gap-3 group hover:border-indigo-200 transition-colors relative">
                  <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0 relative cursor-help" title={note.author_name || "Usuário"}>
                    {note.author_initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-700 block">{note.author_name || "Observação"}</span>
                      <span className="text-[9px] text-slate-400">{new Date(note.created_at).toLocaleDateString('pt-BR')} às {new Date(note.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    {editingNoteId === note.id ? (
                      <div className="mt-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-2 py-2 focus:outline-none focus:border-indigo-500 resize-none min-h-[60px]"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => setEditingNoteId(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleUpdateNote(note.id)} className="p-1 text-emerald-600 hover:text-emerald-700 rounded bg-emerald-50"><Check className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  {editingNoteId !== note.id && (
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 px-1 rounded-md shadow-sm border border-slate-100">
                      <button onClick={() => { setEditingNoteId(note.id); setEditContent(note.content); }} className="p-1 text-slate-400 hover:text-blue-500 transition-colors" title="Editar">
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button onClick={() => handleDeleteNote(note.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Apagar">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))`;
c = c.replace(notesMapTarget, notesMapReplace);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed notes capabilities');
