import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kcqbdjhoekditfgrktvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjcWJkamhvZWtkaXRmZ3JrdHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NTA3OTMsImV4cCI6MjA4MDAyNjc5M30.oqkpd5Kq8WWuZdUvZjuBUVym94f3V0zRxFFOeXYng2A';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdmins() {
    console.log("Checking admin users...");
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, is_admin, full_name');

    if (error) {
        console.error("Error fetching profiles:", error.message);
        return;
    }

    profiles.forEach(p => {
        console.log(`- ${p.full_name} (${p.email}): admin=${p.is_admin}`);
    });
}

checkAdmins();
