const form = document.getElementById('login-form');
const msgEl = document.getElementById('message');
const magicBtn = document.getElementById('magic-link');

const params = new URLSearchParams(window.location.search);
const redirect = params.get('redirect') || 'https://dev.prosperspot.com/';

async function storeSession(access_token) {
  try {
    await fetch('/session/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ access_token }),
    });
  } catch (err) {
    console.error('Failed to set session', err);
  }
}

async function handleSession(session) {
  if (!session) return;
  console.log('access token', session.access_token);
  await storeSession(session.access_token);
  window.location.href = redirect;
}

// Handle already-logged-in users or magic-link callbacks
window.supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) handleSession(data.session);
});
window.supabaseClient.auth.onAuthStateChange((_event, session) => {
  if (session) handleSession(session);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgEl.textContent = '';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    msgEl.textContent = error.message;
    msgEl.className = 'text-danger';
    return;
  }
  await handleSession(data.session);
});

magicBtn.addEventListener('click', async () => {
  msgEl.textContent = '';

  const email = document.getElementById('email').value;

  const redirectTo = `${window.location.origin}/auth.html${window.location.search}`;
  const { error } = await window.supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) {
    msgEl.textContent = error.message;
    msgEl.className = 'text-danger';
  } else {
    msgEl.textContent = 'Magic link sent! Check your email.';
    msgEl.className = 'text-success';
  }
});
