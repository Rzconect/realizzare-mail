require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const db = process.env.DATABASE_URL;
  const poolerUrl = db.replace('5432', '6543').replace('db.', '');
  
  const client = new Client({ 
    connectionString: poolerUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000
  });
  try {
    await client.connect();
    console.log('Connected via pooler!');
    
    await client.query('ALTER TABLE flow_runs ADD COLUMN IF NOT EXISTS metadata JSONB;');
    console.log('OK: flow_runs.metadata added');
    
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'account_settings' ORDER BY ordinal_position;");
    console.log('account_settings columns:', res.rows.map(r => r.column_name).join(', '));
    
    const res2 = await client.query("SELECT * FROM account_settings LIMIT 1;");
    if (res2.rows.length > 0) {
      console.log('account_settings data:', JSON.stringify(res2.rows[0]));
    }
    
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    try { await client.end(); } catch(e) {}
  }
}
run();
