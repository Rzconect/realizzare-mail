const fs = require('fs');
let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

const regex = /const handleSaveNote = async \(\) => \{[\s\S]*?setIsSaving\(false\);\n  \};/;
const newFn = `const handleSaveNote = async () => {
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
  };`;

c = c.replace(regex, newFn);
fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed handleSaveNote');
