import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // I need service role to check some things or just public key if table is public

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking database...');
  
  // Check if we can query clients table to see columns
  const { data, error } = await supabase.from('clients').select('*').limit(1);
  if (error) {
    console.error('Error querying clients:', error);
  } else {
    console.log('Clients table accessible. Columns:', data[0] ? Object.keys(data[0]) : 'No data');
  }

  // Check user_roles
  const { data: roles, error: rolesErr } = await supabase.from('user_roles').select('*').limit(1);
  if (rolesErr) {
    console.error('Error querying user_roles:', rolesErr);
  } else {
    console.log('User roles accessible.');
  }
}

check();
