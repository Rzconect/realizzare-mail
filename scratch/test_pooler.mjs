import pg from 'pg';

const tryConnect = async (url) => {
  console.log('Trying:', url);
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('SUCCESS:', url);
    await client.end();
  } catch (e) {
    console.log('FAILED:', e.message);
  }
};

async function testAll() {
  await tryConnect('postgres://postgres.wgjxhktboboqekzwwcmq:33130169Leo%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres');
  await tryConnect('postgres://postgres:33130169Leo%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres');
  await tryConnect('postgres://postgres:33130169Leo%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres');
  await tryConnect('postgres://postgres:33130169Leo%40@db.wgjxhktboboqekzwwcmq.supabase.co:6543/postgres');
}
testAll();
