require('dotenv').config({path: '.env.local'});
const { Client } = require('pg');

async function run() {
  const connectionString = process.env.DATABASE_URL.replace('5432', '6543');
  const client = new Client({ 
    connectionString,
    // Force IPv4 if Node attempts IPv6 by default and times out
    host: 'db.wgjxhktboboqekzwwcmq.supabase.co' 
  });
  
  // Actually pg might not have a family option directly in config, but we can resolve the IP using dns.
  const dns = require('dns');
  const util = require('util');
  const lookup = util.promisify(dns.lookup);
  
  const { address } = await lookup('db.wgjxhktboboqekzwwcmq.supabase.co', { family: 4 });
  console.log('Resolved IPv4:', address);
  
  const client4 = new Client({
    user: 'postgres',
    password: process.env.DATABASE_URL.match(/:([^:@]+)@/)[1],
    host: address,
    port: 6543,
    database: 'postgres'
  });
  
  await client4.connect();
  await client4.query(`
    CREATE TABLE IF NOT EXISTS public.contact_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
      user_id UUID,
      user_initials TEXT,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.contact_notes;
    CREATE POLICY "Enable all for authenticated users" ON public.contact_notes FOR ALL USING (true);
  `);
  console.log('contact_notes table created successfully via IPv4');
  await client4.end();
}
run().catch(console.error);
