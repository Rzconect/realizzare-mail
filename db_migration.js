
const { Client } = require("pg");

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log("Connected to database");

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS flow_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
        contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'running',
        current_node_id VARCHAR(255),
        next_execution_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS flow_run_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id UUID REFERENCES flow_runs(id) ON DELETE CASCADE,
        node_id VARCHAR(255),
        action_taken TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await client.end();
  }
}

migrate();

