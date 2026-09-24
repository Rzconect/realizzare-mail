import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.wgjxhktboboqekzwwcmq:33130169Leo@@@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
  });
  
  try {
    await client.connect();
    await client.query("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';");
    console.log('Column added successfully with sa-east-1 pooler');
  } catch (err) {
    console.error('Failed sa-east-1:', err.message);
    
    try {
      const client2 = new Client({
        connectionString: "postgresql://postgres.wgjxhktboboqekzwwcmq:33130169Leo@@@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      });
      await client2.connect();
      await client2.query("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';");
      console.log('Column added successfully with us-east-1 pooler');
      await client2.end();
    } catch(e) {
       console.error('Failed us-east-1:', e.message);
    }
  } finally {
    try { await client.end(); } catch(e){}
  }
}

run();
