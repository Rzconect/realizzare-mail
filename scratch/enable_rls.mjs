import pg from 'pg';

const connectionString = 'postgresql://postgres:[33130169Leo@@]@db.wgjxhktboboqekzwwcmq.supabase.co:5432/postgres';
const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function enableRLS() {
  console.log('Connecting to Supabase Direct DB...');
  await client.connect();
  console.log('Connected!');
  
  const result = await client.query(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  `);
  
  for (const row of result.rows) {
    const table = row.tablename;
    console.log(`Enabling RLS on ${table}...`);
    try {
      await client.query(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;`);
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = '${table}' AND policyname = 'allow_all_for_backward_compatibility'
          ) THEN
            CREATE POLICY "allow_all_for_backward_compatibility" ON public."${table}" FOR ALL USING (true);
          END IF;
        END
        $$;
      `);
      console.log(`  Done for ${table}`);
    } catch (e) {
      console.log(`  Error on ${table}:`, e.message);
    }
  }
  
  console.log('Finished enabling RLS and adding fallback policies.');
  await client.end();
}

enableRLS().catch(console.error);
