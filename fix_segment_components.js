const fs = require('fs');

const filesToUpdate = [
  'src/app/dashboard/campaigns/create/page.tsx',
  'src/app/dashboard/contacts/page.tsx'
];

filesToUpdate.forEach(file => {
  let f = fs.readFileSync(file, 'utf8');

  // Fix onChange for SearchableFieldDropdown
  f = f.replace(
    /onChange=\{\(val\) => handleUpdateRuleInGroup\(group\.id, ruleIdx, \{ field: val \}\)\}/g,
    'onChange={(val) => handleUpdateRuleInGroup(group.id, ruleIdx, { field: val, value: "", operator: "eq" })}'
  );

  // Fix expandedGroups in useState
  f = f.replace(
    /useState<Record<string, boolean>>\(\{\s*"Informações pessoais do lead": false,\s*"Cursos e Matrículas": false,\s*"Campanhas e Automação": false,\s*"Campos personalizados": false\s*\}\)/g,
    `useState<Record<string, boolean>>({
    "Informações pessoais do lead": false,
    "Cursos e Matrículas": false,
    "Campanhas e Automação": false,
    "Informações de Pagamento (Pagar.me)": false,
    "Campos personalizados": false
  })`
  );

  // Fix expandedGroups in useEffect
  f = f.replace(
    /setExpandedGroups\(\{\s*"Informações pessoais do lead": false,\s*"Cursos e Matrículas": false,\s*"Campanhas e Automação": false,\s*"Campos personalizados": false\s*\}\)/g,
    `setExpandedGroups({
        "Informações pessoais do lead": false,
        "Cursos e Matrículas": false,
        "Campanhas e Automação": false,
        "Informações de Pagamento (Pagar.me)": false,
        "Campos personalizados": false
      })`
  );

  // Add last_course to courseFields (if not already there)
  if (!f.includes('id: "last_course"')) {
    f = f.replace(
      /const courseFields = \[\s*\{\s*id: "course",\s*label: "Curso Matriculado"\s*\},\s*\{\s*id: "courseStatus"/g,
      `const courseFields = [
    { id: "course", label: "Curso Matriculado" },
    { id: "last_course", label: "Último Curso Iniciado" },
    { id: "courseStatus"`
    );
  }

  // Add pagarmeFields before allFieldsGrouped
  if (!f.includes('const pagarmeFields = [')) {
    f = f.replace(
      /const allFieldsGrouped = \[/g,
      `const pagarmeFields = [
    { id: "payment_order_status", label: "Status do Pedido (Pagar.me)" },
    { id: "payment_method", label: "Método de Pagamento" },
    { id: "payment_amount", label: "Valor do Pedido" },
    { id: "payment_product", label: "Produto Comprado" }
  ];

  const allFieldsGrouped = [`
    );
  }

  // Add pagarmeFields to allFieldsGrouped array
  if (!f.includes('"Informações de Pagamento (Pagar.me)"')) {
    f = f.replace(
      /\{\s*title: "Campos personalizados",\s*items: \(customFields/g,
      `{
      title: "Informações de Pagamento (Pagar.me)",
      items: pagarmeFields
    },
    {
      title: "Campos personalizados",
      items: (customFields`
    );
  }

  // Add pagarmeFields to selectedLabel calculation
  if (!f.includes('pagarmeFields.find')) {
    f = f.replace(
      /\(customFields \|\| \[\]\)\.find\(cf => \`cf_\$\{cf\.tag\}\` === value\)/g,
      `pagarmeFields.find(f => f.id === value)?.label ||\n    (customFields || []).find(cf => \`cf_\${cf.tag}\` === value)`
    );
  }

  fs.writeFileSync(file, f);
  console.log('Updated ' + file);
});
