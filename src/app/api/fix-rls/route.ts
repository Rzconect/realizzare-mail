import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET() {
  const connectionString = "postgresql://postgres:33130169Leo%40%40@db.wgjxhktboboqekzwwcmq.supabase.co:5432/postgres";
  if (!connectionString) return NextResponse.json({ error: "No DATABASE_URL" }, { status: 500 });

  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    const tables = [
      'contacts',
      'reporting_events',
      'purchases',
      'list_subscriptions',
      'contact_tags',
      'enrollments',
      'flow_enrollments',
      'custom_fields',
      'contact_custom_values',
      'lists',
      'tags',
      'courses',
      'flows'
    ];

    const results = [];
    for (const table of tables) {
      try {
        await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
        await client.query(`DROP POLICY IF EXISTS "Enable read access for all users" ON ${table};`);
        await client.query(`CREATE POLICY "Enable read access for all users" ON ${table} FOR SELECT USING (true);`);
        results.push({ table, status: "success" });
      } catch (err: any) {
        results.push({ table, status: "error", message: err.message });
      }
    }
    
    await client.end();
    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
