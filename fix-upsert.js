const fs = require('fs');

let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

const targetSave = `const { error } = await supabase.from("contact_custom_values").upsert({
        contact_id: contactId,
        field_id: NOTES_FIELD_ID,
        value_text: JSON.stringify(updatedNotes)
      }, { onConflict: "contact_id,field_id" });`;

const replacementSave = `
      // Try to check if it exists first
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
`;

c = c.replace(targetSave, replacementSave);

// Do the same for Update and Delete!
const targetUpdate = `await supabase.from("contact_custom_values").upsert({
      contact_id: contactId,
      field_id: NOTES_FIELD_ID,
      value_text: JSON.stringify(updatedNotes)
    }, { onConflict: "contact_id,field_id" });`;

const replacementUpdate = `
    const { data: ex } = await supabase.from("contact_custom_values").select("id").eq("contact_id", contactId).eq("field_id", NOTES_FIELD_ID).single();
    if (ex) {
      await supabase.from("contact_custom_values").update({ value_text: JSON.stringify(updatedNotes) }).eq("id", ex.id);
    } else {
      await supabase.from("contact_custom_values").insert({ contact_id: contactId, field_id: NOTES_FIELD_ID, value_text: JSON.stringify(updatedNotes) });
    }
`;

c = c.replace(targetUpdate, replacementUpdate);
c = c.replace(targetUpdate, replacementUpdate); // Since it appears twice (Delete and Edit)

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed upsert to select-update-insert');
