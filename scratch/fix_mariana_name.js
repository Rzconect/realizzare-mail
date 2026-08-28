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

async function fixMarianaName() {
  const email = 'mariana.siqueira@realizzare.com.br';
  const { data, error } = await supabase
    .from('contacts')
    .update({
      first_name: 'Mariana',
      last_name: 'Siqueira'
    })
    .eq('email', email)
    .select();
  console.log('--- UPDATED MARIANA NAME ---', data, error);
}

fixMarianaName();
