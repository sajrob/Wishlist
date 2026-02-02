import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kcqbdjhoekditfgrktvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjcWJkamhvZWtkaXRmZ3JrdHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NTA3OTMsImV4cCI6MjA4MDAyNjc5M30.oqkpd5Kq8WWuZdUvZjuBUVym94f3V0zRxFFOeXYng2A';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
    console.log("Checking database...");

    const tables = ["profiles", "feedback", "wishlists", "items", "categories"];

    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select("*", { count: "exact", head: true });

            if (error) {
                console.error(`- ${table}: Error - ${error.message}`);
            } else {
                console.log(`- ${table}: ${count} rows`);
            }
        } catch (e) {
            console.error(`- ${table}: Crash - ${e.message}`);
        }
    }
}

checkData();
