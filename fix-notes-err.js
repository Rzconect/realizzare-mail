const fs = require('fs');

let c = fs.readFileSync('src/components/crm/ContactNotes.tsx', 'utf8');

c = c.replace(
  'if (!newNote.trim() || !contactId) return;',
  `if (!contactId) { alert("Este card não possui um contato vinculado. (ID Ausente)"); return; }
    if (!newNote.trim()) return;`
);

c = c.replace(
  'if (!error) {\n        setNotes(updatedNotes);\n        setNewNote("");\n      }\n      setIsSaving(false);',
  `if (!error) {
        setNotes(updatedNotes);
        setNewNote("");
      } else {
        console.error("Erro ao salvar observação:", error);
        alert("Erro ao salvar observação: " + error.message);
      }
      setIsSaving(false);`
);

fs.writeFileSync('src/components/crm/ContactNotes.tsx', c);
console.log('Added error handling to ContactNotes');
