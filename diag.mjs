import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://huhyxyqnmszzdrfswwto.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1aHl4eXFubXN6emRyZnN3d3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MzQ0NzMsImV4cCI6MjA4NzIxMDQ3M30.XMupHHyiABbpm3p8gk6ZbZaGr4PRp3YRQfZpOVTtbrM'
);

async function check() {
    console.log("Checking last 5 credit requests...");
    const { data: cr } = await supabase.from('credit_requests').select('id, client_name, client_email, client_phone, user_id, status').order('created_at', { ascending: false }).limit(5);
    console.log("CR:", JSON.stringify(cr, null, 2));

    console.log("\nChecking last 5 contracts...");
    const { data: co } = await supabase.from('contracts').select('id, client_id, client_name, credit_request_id, status').order('created_at', { ascending: false }).limit(5);
    console.log("CO:", JSON.stringify(co, null, 2));

    console.log("\nChecking last 5 clients...");
    const { data: cl } = await supabase.from('clients').select('id, name, email, phone, user_id, agent_id').order('updated_at', { ascending: false }).limit(5);
    console.log("CL:", JSON.stringify(cl, null, 2));
}

check().catch(console.error);
