"use client";

import { useState, useEffect } from "react";
import { Send, User as UserIcon, Loader2, Trash2, Edit2, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Note {
  id: string;
  content: string;
  author_initials: string;
  author_name?: string;
  created_at: string;
}

const NOTES_FIELD_ID = "09145055-2d08-4d41-b21f-0a9d338044c8";

export default function ContactNotes({ contactId, currentUser, localNotes, onChangeLocalNotes }: { contactId?: string, currentUser?: { initials: string, name: string }, localNotes?: any[], onChangeLocalNotes?: (n: any[]) => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userInitials, setUserInitials] = useState(currentUser?.initials || "UX");
  const [userName, setUserName] = useState(currentUser?.name || "Usuário");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      
      // Get current user for initials
      if (currentUser) {
        setUserInitials(currentUser.initials);
        setUserName(currentUser.name);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata || {};
          const name = meta.full_name || meta.name || (meta.first_name ? `${meta.first_name} ${meta.last_name || ""}` : "");
          if (name) {
            const parts = name.trim().split(" ");
            if (parts.length > 1) {
              setUserInitials((parts[0].charAt(0) + parts[parts.length-1].charAt(0)).toUpperCase());
            } else {
              setUserInitials(parts[0].substring(0, 2).toUpperCase());
            }
            setUserName(name);
          } else if (user.email) {
            setUserInitials(user.email.substring(0, 2).toUpperCase());
            setUserName(user.email.split("@")[0]);
          }
        }
      }

      // Fetch notes
      if (contactId) {
        const { data } = await supabase
          .from("contact_custom_values")
          .select("value_text")
          .eq("contact_id", contactId)
          .eq("field_id", NOTES_FIELD_ID)
          .single();
        
        if (data && data.value_text) {
          try {
            const parsed = JSON.parse(data.value_text);
            if (Array.isArray(parsed)) {
              setNotes(parsed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else if (localNotes) {
        setNotes([...localNotes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
      setIsLoading(false);
    };
    init();
  }, [contactId, currentUser]);

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta observação?")) return;
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    if (onChangeLocalNotes) onChangeLocalNotes(updatedNotes);
    
    if (contactId) {
      const supabase = createClient();
      const { data: ex } = await supabase.from("contact_custom_values").select("id").eq("contact_id", contactId).eq("field_id", NOTES_FIELD_ID).single();
      if (ex) {
        await supabase.from("contact_custom_values").update({ value_text: JSON.stringify(updatedNotes) }).eq("id", ex.id);
      } else {
        await supabase.from("contact_custom_values").insert({ contact_id: contactId, field_id: NOTES_FIELD_ID, value_text: JSON.stringify(updatedNotes) });
      }
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    const updatedNotes = notes.map(n => n.id === noteId ? { ...n, content: editContent } : n);
    setNotes(updatedNotes);
    setEditingNoteId(null);
    if (onChangeLocalNotes) onChangeLocalNotes(updatedNotes);
    
    if (contactId) {
      const supabase = createClient();
      const { data: ex } = await supabase.from("contact_custom_values").select("id").eq("contact_id", contactId).eq("field_id", NOTES_FIELD_ID).single();
      if (ex) {
        await supabase.from("contact_custom_values").update({ value_text: JSON.stringify(updatedNotes) }).eq("id", ex.id);
      } else {
        await supabase.from("contact_custom_values").insert({ contact_id: contactId, field_id: NOTES_FIELD_ID, value_text: JSON.stringify(updatedNotes) });
      }
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    setIsSaving(true);
    const supabase = createClient();
    
    const newNoteObj: Note = {
      id: Math.random().toString(36).substring(7),
      content: newNote.trim(),
      author_initials: userInitials,
      author_name: userName,
      created_at: new Date().toISOString()
    };
    
    const updatedNotes = [newNoteObj, ...notes];
    
    // Optimistic UI Update
    setNotes(updatedNotes);
    setNewNote("");
    if (onChangeLocalNotes) onChangeLocalNotes(updatedNotes);
    
    if (contactId) {
      const { data: existingData } = await supabase.from("contact_custom_values").select("id").eq("contact_id", contactId).eq("field_id", NOTES_FIELD_ID).single();
      let error;
      if (existingData) {
        const { error: updateErr } = await supabase.from("contact_custom_values").update({ value_text: JSON.stringify(updatedNotes) }).eq("id", existingData.id);
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase.from("contact_custom_values").insert({
          contact_id: contactId,
          field_id: NOTES_FIELD_ID,
          value_text: JSON.stringify(updatedNotes)
        });
        error = insertErr;
      }
      
      if (error) {
        setNotes(notes); // Revert UI
      }
    }
    
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {isLoading ? (
        <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar" style={{ minHeight: "150px" }}>
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-xl border border-slate-100">Nenhuma observação ainda.</p>
          ) : (
            notes.map(note => (
                <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex gap-3 group hover:border-indigo-200 transition-colors relative">
                  <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0 relative cursor-help" title={note.author_name || "Usuário"}>
                    {note.author_initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(note.created_at).toLocaleDateString('pt-BR')} às {new Date(note.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
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
              ))
          )}
        </div>
      )}

      <div className="mt-auto relative pt-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Adicionar observação sobre o aluno..."
          className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none min-h-[70px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSaveNote();
            }
          }}
        />
        <button 
          onClick={handleSaveNote}
          disabled={isSaving || !newNote.trim()}
          className="absolute right-2.5 bottom-4 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 -ml-0.5 mt-0.5" />}
        </button>
      </div>
    </div>
  );
}
