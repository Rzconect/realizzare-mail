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

async function inspectCourses() {
  const { data: courses, error: cErr } = await supabase.from('courses').select('*');
  console.log('--- COURSES ---', courses, cErr);

  const { data: enrollments, error: eErr } = await supabase.from('enrollments').select('*');
  console.log('--- ALL ENROLLMENTS ---', enrollments, eErr);
}

inspectCourses();
