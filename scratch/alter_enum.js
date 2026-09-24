const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => client.query("ALTER TYPE course_event_type ADD VALUE IF NOT EXISTS 'test_approved';"))
  .then(() => console.log('Enum updated'))
  .catch(console.error)
  .finally(() => client.end());
