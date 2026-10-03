const fs = require('fs');
let f = fs.readFileSync('src/app/dashboard/campaigns/create/page.tsx', 'utf8');

// 1. Fix the expandedGroups initial state to include Pagar.me
f = f.replace(
  `setExpandedGroups({
        "Informações pessoais do lead": false,
        "Cursos e Matrículas": false,
        "Campanhas e Automação": false,
        "Campos personalizados": false
      });`,
  `setExpandedGroups({
        "Informações pessoais do lead": false,
        "Cursos e Matrículas": false,
        "Campanhas e Automação": false,
        "Informações de Pagamento (Pagar.me)": false,
        "Campos personalizados": false
      });`
);

// 2. Fix the initial expandedGroups state in useState
f = f.replace(
  `useState<Record<string, boolean>>({
    "Informações pessoais do lead": false,
    "Cursos e Matrículas": false,
    "Campanhas e Automação": false,
    "Campos personalizados": false
  })`,
  `useState<Record<string, boolean>>({
    "Informações pessoais do lead": false,
    "Cursos e Matrículas": false,
    "Campanhas e Automação": false,
    "Informações de Pagamento (Pagar.me)": false,
    "Campos personalizados": false
  })`
);

// 3. Add pagarmeFields and add to allFieldsGrouped
f = f.replace(
  `  const engagementFields = [
    { id: "tag", label: "Possui Tag" },
    { id: "email_received", label: "Recebeu E-mail" },
    { id: "email_opened", label: "Abriu E-mail" },
    { id: "email_clicked", label: "Clicou em E-mail" },
    { id: "active_in_list", label: "Inscrito na Lista" },
    { id: "active_in_flow", label: "Ativo na Automação" }
  ];

  const allField`,
  `  const engagementFields = [
    { id: "tag", label: "Possui Tag" },
    { id: "email_received", label: "Recebeu E-mail" },
    { id: "email_opened", label: "Abriu E-mail" },
    { id: "email_clicked", label: "Clicou em E-mail" },
    { id: "active_in_list", label: "Inscrito na Lista" },
    { id: "active_in_flow", label: "Ativo na Automação" }
  ];

  const pagarmeFields = [
    { id: "payment_order_status", label: "Status do Pedido (Pagar.me)" },
    { id: "payment_method", label: "Método de Pagamento" },
    { id: "payment_amount", label: "Valor do Pedido" },
    { id: "payment_product", label: "Produto Comprado" }
  ];

  const allField`
);

// 4. Add pagarmeFields group to allFieldsGrouped
f = f.replace(
  `    {
      title: "Campos personalizados",
      items: (customFields || []).map((cf) => ({
        id: \`cf_\${cf.tag}\`,
        label: \`\${cf.name} ({{ \${cf.tag} }})\`
      }))
    }
  ];

  const selectedLabel = 
    personalFields.find(f => f.id === value)?.label ||
    courseFields.find(f => f.id === value)?.label ||
    engagementFields.find(f => f.id === value)?.label ||
    (customFields || []).find(cf => \`cf_\${cf.tag}\` === value)?.name ||
    (customFields || []).find(cf => cf.tag === value)?.name ||
    value;`,
  `    {
      title: "Informações de Pagamento (Pagar.me)",
      items: pagarmeFields
    },
    {
      title: "Campos personalizados",
      items: (customFields || []).map((cf) => ({
        id: \`cf_\${cf.tag}\`,
        label: \`\${cf.name} ({{ \${cf.tag} }})\`
      }))
    }
  ];

  const selectedLabel = 
    personalFields.find(f => f.id === value)?.label ||
    courseFields.find(f => f.id === value)?.label ||
    engagementFields.find(f => f.id === value)?.label ||
    pagarmeFields.find(f => f.id === value)?.label ||
    (customFields || []).find(cf => \`cf_\${cf.tag}\` === value)?.name ||
    (customFields || []).find(cf => cf.tag === value)?.name ||
    value;`
);

fs.writeFileSync('src/app/dashboard/campaigns/create/page.tsx', f);
console.log('Done');
