import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() { 
  const { data } = await supabaseAdmin.auth.admin.listUsers(); 
  data.users.forEach(u => console.log(u.email, u.user_metadata)); 
}
run();
