import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() { 
  const { data } = await supabaseAdmin.auth.admin.listUsers(); 
  const u = data.users.find(u => u.email === 'contato@realizzarecursos.com.br'); 
  if(u) { 
    console.log('Updating user', u.id); 
    await supabaseAdmin.auth.admin.updateUserById(u.id, { user_metadata: { name: 'Realizzare Cursos' } }); 
    console.log('Done!'); 
  } 
}
run();
