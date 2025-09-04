const form = document.getElementById('login-form');
const msgEl = document.getElementById('message');
const magicBtn = document.getElementById('magic-link');
const signupForm = document.getElementById('signup-form');
const signupMsg = document.getElementById('signup-message');

const params = new URLSearchParams(window.location.search);
const redirectParam = params.get('redirect');
let redirect = '/pricing.html';
if (redirectParam) {
  try {
    const url = new URL(redirectParam, window.location.origin);
    if (url.origin === window.location.origin && url.pathname.startsWith('/')) {
      redirect = url.pathname + url.search;
    }
  } catch {}
}
const onAuthPage = window.location.pathname.includes('auth.html');

function handleSession(session) {
  if (!session) return;
  window.location.href = redirect;
}

// Handle already-logged-in users or magic-link callbacks
window.supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session && onAuthPage) handleSession(data.session);
});
window.supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session && (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && onAuthPage))) {
    handleSession(session);
  }
});

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      msgEl.textContent = error.message;
      msgEl.className = 'text-danger';
      return;
    }
  });

  magicBtn?.addEventListener('click', async () => {
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
}

signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupMsg.textContent = '';

  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  const { error } = await window.supabaseClient.auth.signUp({ email, password });
  if (error) {
    signupMsg.textContent = error.message;
    signupMsg.className = 'text-danger';
  } else {
    signupMsg.textContent = 'Check your email for a confirmation link.';
    signupMsg.className = 'text-success';
  }
});
