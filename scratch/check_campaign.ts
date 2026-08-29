
import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('campaigns').select('*').eq('id', 'be04f38d-36ca-42c0-bad6-695f817e7f55').single();
  console.log(data);
}
run();

