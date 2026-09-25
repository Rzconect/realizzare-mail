const fs = require('fs');
let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

c = c.replace(`      if (!error) {
        setNotes(updatedNotes);
        setNewNote("");
      }
      setIsSaving(false);`, `      if (!error) {
        setNotes(updatedNotes);
        setNewNote("");
      } else {
        alert("Erro ao salvar observação: " + (error.message || JSON.stringify(error)));
      }
      setIsSaving(false);`);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Fixed ContactNotes alert');
