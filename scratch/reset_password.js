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

async function resetPassword() {
  const email = 'contato@realizzarecursos.com.br';
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.log('User not found');
    return;
  }

  // Set password to standard default password
  const newPassword = 'Realizzare@2026';
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true
  });

  if (error) {
    console.error('Error resetting password:', error);
  } else {
    console.log(`✓ Password for ${email} successfully reset to: ${newPassword}`);
  }
}

resetPassword();
