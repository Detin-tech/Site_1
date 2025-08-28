document.addEventListener('DOMContentLoaded', () => {

    // Mobile Navigation Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // On-Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });

    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => observer.observe(el));

    // Use Cases Tabs
    const tabsContainer = document.querySelector('.tabs');
    const tabPanes = document.querySelectorAll('.tab-pane');

    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                const targetTab = e.target.dataset.tab;

                tabsContainer.querySelectorAll('.tab-button').forEach(tab => {
                    tab.classList.remove('active');
                });
                e.target.classList.add('active');

                tabPanes.forEach(pane => {
                    if (pane.id === targetTab) {
                        pane.classList.add('active');
                    } else {
                        pane.classList.remove('active');
                    }
                });
            }
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const expanded = question.getAttribute('aria-expanded') === 'true';
            question.setAttribute('aria-expanded', String(!expanded));
            item.classList.toggle('active', !expanded);
            if (!expanded) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.opacity = 1;
            } else {
                answer.style.maxHeight = 0;
                answer.style.opacity = 0;
            }
            if (question.dataset.key) {
                window.dataLayer?.push({ event: 'faq_toggle', question: question.dataset.key });
            }
        });
    });

    // Support Form
    const supportForm = document.getElementById('support-form');
    if (supportForm) {
        const fields = {
            name: supportForm.querySelector('#support-name'),
            email: supportForm.querySelector('#support-email'),
            message: supportForm.querySelector('#support-message'),
            honey: supportForm.querySelector('#support-company')
        };
        const submitBtn = document.getElementById('support-submit');
        const responseEl = document.getElementById('support-response');

        const validators = {
            name: v => v.trim().length > 0,
            email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: v => v.trim().length > 0
        };

        function validateField(key) {
            const field = fields[key];
            const valid = validators[key](field.value);
            field.parentElement.classList.toggle('invalid', !valid);
            return valid;
        }

        function checkForm() {
            const valid = ['name', 'email', 'message'].every(validateField);
            submitBtn.disabled = !valid;
            return valid;
        }

        ['name', 'email', 'message'].forEach(k => {
            fields[k].addEventListener('input', () => { validateField(k); checkForm(); });
            fields[k].addEventListener('blur', () => validateField(k));
        });

        supportForm.addEventListener('submit', async e => {
            e.preventDefault();
            if (fields.honey.value) return; // honeypot
            if (!checkForm()) return;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-spinner"></span>Sending…';
            responseEl.textContent = '';
            responseEl.className = 'form-response';

            try {
                const res = await fetch(supportForm.action, {
                    method: supportForm.method,
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({
                        name: fields.name.value.trim(),
                        email: fields.email.value.trim(),
                        message: fields.message.value.trim()
                    })
                });
                if (!res.ok) throw new Error('Request failed');
                submitBtn.innerHTML = '✓';
                responseEl.textContent = "Message sent. We'll get back to you soon.";
                responseEl.classList.add('success');
                window.dataLayer?.push({ event: 'support_submit_success' });
                supportForm.reset();
                checkForm();
            } catch (err) {
                submitBtn.innerHTML = '!';
                responseEl.textContent = 'Something went wrong. Please try again.';
                responseEl.classList.add('error');
                window.dataLayer?.push({ event: 'support_submit_error' });
            } finally {
                setTimeout(() => {
                    submitBtn.innerHTML = 'Send';
                    checkForm();
                }, 2000);
            }
        });
    }

    // Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});
