// Allow overriding via globals set by the hosting page. Fallback to placeholders
// that can be replaced at deploy time or during development.
const SUPABASE_URL =
  window.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY =
  window.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: { persistSession: true },
  },
);

