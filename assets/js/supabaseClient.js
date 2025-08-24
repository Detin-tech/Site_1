// Supabase credentials are provided via globals defined before this script loads.
const SUPABASE_URL = window.SUPABASE_URL || "https://...";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "your-supabase-anon-key";

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true },
});

