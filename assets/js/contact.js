document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    try {
      const endpoint = form.getAttribute("action");
      const response = await fetch(endpoint, {
        method: form.getAttribute("method") || "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
      if (response.ok) {
        alert("Thanks for contacting us!");
        form.reset();
      } else {
        alert("Oops! There was a problem submitting your form.");
      }
    } catch (error) {
      alert("Oops! There was a problem submitting your form.");
    }
  });
});

