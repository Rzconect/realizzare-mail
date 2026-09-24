const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => client.query("ALTER TABLE purchases ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;"))
  .then(() => console.log('Column added'))
  .catch(console.error)
  .finally(() => client.end());
