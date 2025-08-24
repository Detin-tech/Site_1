// Supabase credentials are provided via globals defined before this script loads.
if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
  throw new Error('Supabase credentials missing');
}

window.supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY,
  { auth: { persistSession: true } }
);
