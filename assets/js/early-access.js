document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('early-access-modal');
  if (!modalEl) return;
  const modal = new bootstrap.Modal(modalEl);
  const triggers = document.querySelectorAll('.product-popup');
  triggers.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      modal.show();
    });
  });

  const form = modalEl.querySelector('form');
  const emailInput = form.querySelector('input[type="email"]');
  const messageEl = modalEl.querySelector('.message');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    messageEl.textContent = '';
    try {
      const res = await fetch('/request-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        messageEl.textContent = 'Request sent!';
        form.reset();
      } else {
        messageEl.textContent = 'Failed to send. Please try again.';
      }
    } catch {
      messageEl.textContent = 'Failed to send. Please try again.';
    }
  });
});
