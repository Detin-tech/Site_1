const form = document.getElementById('login-form');
const msgEl = document.getElementById('message');
const magicBtn = document.getElementById('magic-link');

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
  try {
    await fetch('/session/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ access_token: data.session.access_token }),
    });
  } catch (err) {
    console.error('Failed to set session', err);
  }
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || 'https://dev.prosperspot.com/';
  window.location.href = redirect;
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
