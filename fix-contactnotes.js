const fs = require('fs');
let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

c = c.replace(/if \(contactId\) \{[\s\S]*?\} else \{\n*?\s*setIsLoading\(false\);\n*?\s*\}/, `if (contactId) {
        // fetching...
      }`);

c = c.replace(`      // Fetch notes
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
      setIsLoading(false);`, `      // Fetch notes
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
      setIsLoading(false);`);

c = c.replace(`  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta observação?")) return;
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    const supabase = createClient();
    
    const { data: ex } = await supabase.from("contact_custom_values").select("id").eq("contact_id", contactId).eq("field_id", NOTES_FIELD_ID).single();
    if (ex) {
      await supabase.from("contact_custom_values").update({ value_text: JSON.stringify(updatedNotes) }).eq("id", ex.id);
    } else {
      await supabase.from("contact_custom_values").insert({ contact_id: contactId, field_id: NOTES_FIELD_ID, value_text: JSON.stringify(updatedNotes) });
    }

  };`, `  const handleDeleteNote = async (noteId: string) => {
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
  };`);

c = c.replace(`  const handleUpdateNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    const updatedNotes = notes.map(n => n.id === noteId ? { ...n, content: editContent } : n);
    setNotes(updatedNotes);
    setEditingNoteId(null);
    const supabase = createClient();
    
    const { data: ex } = await supabase.from("contact_custom_values").select("id").eq("contact_id", contactId).eq("field_id", NOTES_FIELD_ID).single();
    if (ex) {
      await supabase.from("contact_custom_values").update({ value_text: JSON.stringify(updatedNotes) }).eq("id", ex.id);
    } else {
      await supabase.from("contact_custom_values").insert({ contact_id: contactId, field_id: NOTES_FIELD_ID, value_text: JSON.stringify(updatedNotes) });
    }

  };`, `  const handleUpdateNote = async (noteId: string) => {
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
  };`);

c = c.replace(`  const handleSaveNote = async () => {
    if (!contactId) { alert("Este card nǜo possui um contato vinculado. (ID Ausente)"); return; }`, `  const handleSaveNote = async () => {`);

c = c.replace(`    setNotes(updatedNotes);
    setNewNote("");
    
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
      setNotes(notes); // revert on error
    }
    setIsSaving(false);
  };`, `    setNotes(updatedNotes);
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
        setNotes(notes); // revert on error
      }
    }
    setIsSaving(false);
  };`);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed ContactNotes.tsx');
