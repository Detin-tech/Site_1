document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const messageContainer = document.getElementById("form-message");
  let messageTimeout;
  if (!form) return;

  function showMessage(text, type = "success") {
    if (!messageContainer) return;
    messageContainer.textContent = text;
    messageContainer.className = `alert alert-${type} mt-3`;
    if (messageTimeout) clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
      messageContainer.classList.add("d-none");
    }, 3000);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());
    try {
      const endpoint = form.getAttribute("action");
      const response = await fetch(endpoint, {
        method: form.getAttribute("method") || "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        showMessage("Thanks for contacting us!", "success");
        form.reset();
      } else {
        showMessage("Oops! There was a problem submitting your form.", "danger");
      }
    } catch (error) {
      showMessage("Oops! There was a problem submitting your form.", "danger");
    }
  });
});

