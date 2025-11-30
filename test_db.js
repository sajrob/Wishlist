
import { supabase } from './src/supabaseClient.js';

async function testConnection() {
    console.log("Testing Supabase Connection...");

    // 1. Check Auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log("Auth Check:", authError ? "Error: " + authError.message : "OK");

    // 2. Check Profiles Table (Public access check)
    // We try to select 1 row. Even if empty, it should not error if table exists.
    const { data, error } = await supabase.from('profiles').select('count').limit(1);

    if (error) {
        console.error("Database Error (Profiles):", error.message);
        console.error("Details:", error);
        if (error.code === '42P01') {
            console.error("CRITICAL: Table 'profiles' does not exist. You need to run the SQL schema!");
        }
    } else {
        console.log("Database Check (Profiles): OK - Table exists.");
    }

    // 3. Check Categories Table
    const { error: catError } = await supabase.from('categories').select('count').limit(1);
    if (catError) {
        console.error("Database Error (Categories):", catError.message);
    } else {
        console.log("Database Check (Categories): OK - Table exists.");
    }
}

testConnection();
