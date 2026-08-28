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

async function checkAuthUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  console.log('Users found in Supabase Auth:');
  data.users.forEach(u => {
    console.log(`- Email: ${u.email} | Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'} | Metadata:`, u.user_metadata);
  });
}

checkAuthUsers();
