document.addEventListener('DOMContentLoaded', async () => {
  const planEl = document.getElementById('account-plan');
  const statusEl = document.getElementById('account-status');
  const dateEl = document.getElementById('account-date');
  const billingBtn = document.getElementById('manage-billing');
  const versionEl = document.getElementById('build-version');
  const usageEl = document.querySelector('.usage-counters');
  if (versionEl) versionEl.textContent = window.APP_VERSION || '';

  let { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = `auth.html?redirect=${encodeURIComponent('/account.html')}`;
    return;
  }

  const { data, error } = await window.supabaseClient
    .from('subscriptions')
    .select('plan,status,trial_end,renews_at')
    .eq('user_id', session.user.id)
    .single();

  if (data && !error) {
    planEl.textContent = data.plan;
    statusEl.textContent = data.status;
    if (data.status === 'on_trial' && data.trial_end) {
      dateEl.textContent = `Trial ends: ${new Date(data.trial_end).toLocaleDateString()}`;
    } else if (data.renews_at) {
      dateEl.textContent = `Renews: ${new Date(data.renews_at).toLocaleDateString()}`;
    } else {
      dateEl.textContent = '';
    }
    if (['student', 'standard'].includes(data.plan)) {
      usageEl?.classList.add('d-none');
    } else {
      usageEl?.classList.remove('d-none');
    }
  }

  billingBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/billing-portal');
      const { url } = await res.json();
      if (url) window.location = url;
    } catch (err) {
      // no-op
    }
  });
});
