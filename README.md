# Site_1
Website for simple online tools

## Webhook server

An Express webhook handler listens for Lemon Squeezy subscription events and
provisions users in OWUI. Configure the environment variables listed in
`.env.example` and start the server with `npm start`.

## Supabase login

A basic login page powered by Supabase is available at `login.html`. Configure your
Supabase project credentials by setting `SUPABASE_URL` and `SUPABASE_ANON_KEY` in
`.env` or directly in `assets/js/supabaseClient.js`.
