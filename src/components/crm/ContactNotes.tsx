"use client";

import { useState, useEffect } from "react";
import { Send, User as UserIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Note {
  id: string;
  content: string;
  author_initials: string;
  created_at: string;
}

const NOTES_FIELD_ID = "09145055-2d08-4d41-b21f-0a9d338044c8";

export default function ContactNotes({ contactId }: { contactId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userInitials, setUserInitials] = useState("UX");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      
      // Get current user for initials
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('first_name, last_name, email').eq('id', session.user.id).single();
        if (profile) {
          const fn = profile.first_name || "";
          const ln = profile.last_name || "";
          if (fn || ln) {
            setUserInitials((fn.charAt(0) + ln.charAt(0)).toUpperCase());
          } else if (profile.email) {
            setUserInitials(profile.email.substring(0, 2).toUpperCase());
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
      }
      setIsLoading(false);
    };
    init();
  }, [contactId]);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !contactId) return;
    setIsSaving(true);
    const supabase = createClient();
    
    const newNoteObj: Note = {
      id: Math.random().toString(36).substring(7),
      content: newNote.trim(),
      author_initials: userInitials,
      created_at: new Date().toISOString()
    };
    
    const updatedNotes = [newNoteObj, ...notes];
    
    const { error } = await supabase.from("contact_custom_values").upsert({
      contact_id: contactId,
      field_id: NOTES_FIELD_ID,
      value_text: JSON.stringify(updatedNotes)
    }, { onConflict: "contact_id,field_id" });
    
    if (!error) {
      setNotes(updatedNotes);
      setNewNote("");
    }
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {isLoading ? (
        <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-xl border border-slate-100">Nenhuma observação ainda.</p>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex gap-3 group hover:border-indigo-200 transition-colors">
                <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0">
                  {note.author_initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-700 block">Observação</span>
                    <span className="text-[9px] text-slate-400">{new Date(note.created_at).toLocaleDateString('pt-BR')} às {new Date(note.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
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
