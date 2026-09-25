const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace('<div className="p-4 space-y-4">', '<div className="p-4 pb-32 space-y-4">');
c = c.replace('<div className="p-4 space-y-2">', '<div className="p-4 pb-32 space-y-2">');

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);

// Also modify ContactNotes.tsx to be optimistic update!
let notesCode = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

notesCode = notesCode.replace(`    const updatedNotes = [newNoteObj, ...notes];
    
    
      const { data: existingData } = await supabase.from("contact_custom_values").select("id").eq("contact_id", contactId).eq("field_id", NOTES_FIELD_ID).single();`,
`    const updatedNotes = [newNoteObj, ...notes];
    setNotes(updatedNotes);
    setNewNote("");
    
      const { data: existingData } = await supabase.from("contact_custom_values").select("id").eq("contact_id", contactId).eq("field_id", NOTES_FIELD_ID).single();`);

notesCode = notesCode.replace(`    if (!error) {
      setNotes(updatedNotes);
      setNewNote("");
    }`, `    if (error) {
      setNotes(notes); // revert on error
    }`);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', notesCode);

console.log('Fixed panel padding and optimistic update');
