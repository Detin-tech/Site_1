# Site_1
Website for simple online tools

## Webhook server

An Express webhook handler verifies Lemon Squeezy subscription events and logs
them. Downstream processing (such as forwarding or queuing jobs) can be added in
your own worker. Configure the environment variables listed in `.env.example`
and start the server with `npm start`.

## Supabase login

An auth page powered by Supabase is available at `auth.html`. It supports
password and magic link login. Sessions persist client-side with Supabase; on
sign in the page redirects to the requested path. `logout.html` signs out via
Supabase and then redirects to `auth.html`. Configure your Supabase project
credentials by setting `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env` or
directly in `assets/js/supabaseClient.js`.
