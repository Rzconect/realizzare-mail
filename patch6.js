const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf-8');

const oldCreationEvent = `        // Always add contact creation event
        rawEvents.push({
          id: \`created-\${contact.id}\`,
          type: "import",
          label: "Contato Cadastrado",
          details: \`Cadastrado via \${contact.source || "WordPress Realizzare Integration"}\`,
          payload: { contact_id: contact.id, source: contact.source, created_at: contact.created_at, email: contact.email },
          timestamp: contact.created_at
        });`;

const newCreationEvent = `        // Smart inference of origin based on data
        let sourceDetail = "captura de lead";
        if (contact.source === "import" || contact.source === "importation") {
          sourceDetail = "importação de lista";
        } else if (contact.source === "manual") {
          sourceDetail = "registro manual pelo painel";
        } else if (contact.source === "pagarme" || purchases.length > 0) {
          sourceDetail = "nova transação no pagar.me";
        } else if (enrollments.length > 0) {
          sourceDetail = "matrícula em curso";
        } else if (contact.source) {
          sourceDetail = contact.source;
        }

        // Always add contact creation event
        rawEvents.push({
          id: \`created-\${contact.id}\`,
          type: "import",
          label: "Contato Cadastrado",
          details: \`Registrado através de \${sourceDetail}\`,
          payload: { contact_id: contact.id, source: contact.source, created_at: contact.created_at, email: contact.email },
          timestamp: contact.created_at
        });`;

content = content.replace(oldCreationEvent, newCreationEvent);
fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', content, 'utf-8');
console.log('Done patch 6.');
