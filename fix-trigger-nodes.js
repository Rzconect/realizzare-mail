require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const crypto = require('crypto');

function uuidv4() {
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return [
    bytes.slice(0,4).toString('hex'),
    bytes.slice(4,6).toString('hex'),
    bytes.slice(6,8).toString('hex'),
    bytes.slice(8,10).toString('hex'),
    bytes.slice(10,16).toString('hex')
  ].join('-');
}

async function fixFlows() {
  const fixes = [
    { flowId: '2b96f10c-6b88-479c-a9fb-a64b63586e15', name: 'Matricula Realizada - Geral', trigger_type: 'Fonte: API - Regras: [Diferente de] NR 10', nodeOperator: 'Diferente de', nodeValue: ['NR 10'], event: 'Matrícula Realizada' },
    { flowId: '08a07129-3d76-4e50-869a-a361954bd4b6', name: 'Matricula Realizada - NR10', trigger_type: 'Fonte: API - Regras: [É igual a] NR 10', nodeOperator: 'É igual a', nodeValue: ['NR 10'], event: 'Matrícula Realizada' },
    { flowId: '09bdebed-980e-403a-83fc-ab3bfb2d98dc', name: 'Certificado Digital Emitido - NR10', trigger_type: 'Fonte: API - Regras: [É igual a] NR 10', nodeOperator: 'É igual a', nodeValue: ['NR 10'], event: 'Certificado Emitido (certificate_issued)' }
  ];

  for (const fix of fixes) {
    const triggerConfig = {
      name: 'Gatilho de Entrada',
      rule: 'Nome do Curso específico',
      operator: fix.nodeOperator,
      value: fix.nodeValue,
      source: 'api',
      event: fix.event,
      triggerDescription: fix.trigger_type
    };

    const { error } = await supabase.from('flow_nodes').insert({
      id: uuidv4(),
      flow_id: fix.flowId,
      node_type: 'trigger',
      parent_node_id: null,
      branch_label: null,
      config: triggerConfig,
      is_deleted: false
    });
    console.log(fix.name, ':', error ? error.message : 'OK');
  }
  console.log('Done!');
}
fixFlows();
