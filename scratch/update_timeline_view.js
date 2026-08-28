const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envConfig = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envConfig.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
    env[match[1]] = value;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function updateTimelineView() {
  const sql = `
  CREATE OR REPLACE VIEW contact_timeline_view AS
  SELECT
      ee.id::text AS id,
      ee.contact_id,
      ee.org_id,
      'email' AS event_group,
      ee.event_type::text AS label,
      ee.metadata,
      ee.created_at
  FROM email_events ee
  UNION ALL
  SELECT
      ce.id::text AS id,
      ce.contact_id,
      ce.org_id,
      'course' AS event_group,
      ce.event_type::text AS label,
      ce.metadata,
      ce.created_at
  FROM course_events ce
  UNION ALL
  SELECT
      p.id::text AS id,
      p.contact_id,
      p.org_id,
      'purchase' AS event_group,
      p.product_name AS label,
      jsonb_build_object('amount', p.amount, 'status', p.status, 'sku', p.sku) AS metadata,
      p.paid_at AS created_at
  FROM purchases p
  UNION ALL
  SELECT
      fe.id::text AS id,
      fe.contact_id,
      fe.org_id,
      'flow' AS event_group,
      fe.status::text AS label,
      jsonb_build_object('flow_id', fe.flow_id) AS metadata,
      fe.entered_at AS created_at
  FROM flow_enrollments fe;
  `;

  // Use rpc or direct sql execute if enabled, or test querying
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  console.log('--- RPC RESULT ---', data, error);
}

updateTimelineView();
