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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testLogin() {
  const email = 'contato@realizzarecursos.com.br';
  const password = 'Realizzare@2026';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Login failed:', error);
  } else {
    console.log('✓ LOGIN SUCCESSFUL!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
  }
}

testLogin();
