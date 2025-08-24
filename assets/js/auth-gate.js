(async () => {
  const {
    data: { session },
  } = await window.supabaseClient.auth.getSession();
  if (!session) window.location.href = '/auth.html';
})();
