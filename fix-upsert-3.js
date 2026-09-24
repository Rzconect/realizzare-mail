const fs = require('fs');

let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

const regex = /const \{ error \} = await supabase\.from\("contact_custom_values"\)\.upsert\(\{[\s\S]*?\}\, \{ onConflict: "contact_id,field_id" \}\);/;

const replacement = `
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

c = c.replace(regex, replacement);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed third upsert');
