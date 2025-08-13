document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
  const msgEl = document.getElementById('message');
  if (error) {
    msgEl.textContent = error.message;
    msgEl.className = 'text-danger';
  } else {
    msgEl.textContent = 'Logged in successfully!';
    msgEl.className = 'text-success';
  }
});
