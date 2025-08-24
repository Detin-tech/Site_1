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
credentials by editing `assets/js/supabaseEnv.js`, which sets
`window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY` before
`assets/js/supabaseClient.js` loads.
Ensure the Supabase library, `assets/js/supabaseEnv.js`, and `assets/js/supabaseClient.js` load in that order.
In the browser console on `auth.html`, verify `window.SUPABASE_URL`, `window.SUPABASE_ANON_KEY`, and `window.supabaseClient` are defined.
When submitting the login form, the `/auth/v1/token` request should include the anon key in both the `apikey` and `authorization` headers.
