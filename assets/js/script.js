const loginLink = document.querySelector('.nav-login');
const logoutLink = document.querySelector('.nav-logout');
const accountLink = document.querySelector('.nav-account');
const openAppLink = document.querySelector('.nav-open-app');
const upgradeLinks = document.querySelectorAll('.nav-upgrade');
let currentSession = null;
let wasLoggedIn = false;

if (localStorage.getItem('ps_logged_in') === 'true') {
    loginLink?.classList.add('d-none');
    accountLink?.classList.remove('d-none');
    logoutLink?.classList.remove('d-none');
    openAppLink?.classList.remove('d-none');
    wasLoggedIn = true;
}

const setRedirect = () => {
    if (loginLink) {
        const current = window.location.pathname + window.location.search;
        loginLink.href = `auth.html?redirect=${encodeURIComponent(current)}`;
    }
};

setRedirect();

function showLogoutBanner() {
    if (document.getElementById('session-expired')) return;
    const banner = document.createElement('div');
    banner.id = 'session-expired';
    banner.className = 'session-expired';
    const redirect = window.location.pathname + window.location.search;
    banner.innerHTML = `Logged out due to inactivity — <a href="auth.html?redirect=${encodeURIComponent(redirect)}">Log in again</a>`;
    document.body.prepend(banner);
}

function updateNav(session) {
    currentSession = session;
    if (session) {
        loginLink?.classList.add('d-none');
        accountLink?.classList.remove('d-none');
        logoutLink?.classList.remove('d-none');
        openAppLink?.classList.remove('d-none');
        localStorage.setItem('ps_logged_in', 'true');
        document.getElementById('session-expired')?.remove();
        wasLoggedIn = true;
    } else {
        loginLink?.classList.remove('d-none');
        accountLink?.classList.add('d-none');
        logoutLink?.classList.add('d-none');
        openAppLink?.classList.add('d-none');
        localStorage.setItem('ps_logged_in', 'false');
        if (wasLoggedIn) showLogoutBanner();
        wasLoggedIn = false;
        setRedirect();
    }
}

let waitlistModal;

function createWaitlistModal() {
    waitlistModal = document.createElement('div');
    waitlistModal.id = 'waitlist-modal';
    waitlistModal.className = 'waitlist-modal';
    waitlistModal.innerHTML = `
        <div class="modal-content">
            <button type="button" class="modal-close" aria-label="Close">&times;</button>
            <h2>Join the waitlist</h2>
            <form id="waitlist-form" action="/waitlist" method="POST" novalidate>
                <div class="field">
                    <label for="wl-name">Name</label>
                    <input type="text" id="wl-name" name="name" required>
                    <div class="error">Name is required.</div>
                </div>
                <div class="field">
                    <label for="wl-email">Email</label>
                    <input type="email" id="wl-email" name="email" required>
                    <div class="error">Valid email required.</div>
                </div>
                <div class="field">
                    <label for="wl-message">Message</label>
                    <textarea id="wl-message" name="message" required></textarea>
                    <div class="error">Message is required.</div>
                </div>
                <input type="hidden" id="wl-plan" name="plan">
                <button type="submit" class="btn btn-primary" id="wl-submit" disabled>Send</button>
                <div id="wl-response" class="form-response" aria-live="polite"></div>
            </form>
        </div>`;
    document.body.appendChild(waitlistModal);

    const closeBtn = waitlistModal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => waitlistModal.classList.remove('active'));
    waitlistModal.addEventListener('click', (e) => {
        if (e.target === waitlistModal) waitlistModal.classList.remove('active');
    });

    const form = waitlistModal.querySelector('#waitlist-form');
    const submitBtn = waitlistModal.querySelector('#wl-submit');
    const response = waitlistModal.querySelector('#wl-response');
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            submitBtn.disabled = !Array.from(inputs).every(i => i.value.trim());
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        try {
            const resp = await fetch(form.getAttribute('action'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (resp.ok) {
                response.textContent = 'Thanks for joining!';
                response.className = 'form-response success';
                form.reset();
                submitBtn.disabled = true;
            } else {
                throw new Error('Request failed');
            }
        } catch {
            response.textContent = 'Oops! There was a problem submitting your form.';
            response.className = 'form-response error';
        }
    });
}

function openWaitlistModal(plan) {
    if (!waitlistModal) createWaitlistModal();
    const planInput = waitlistModal.querySelector('#wl-plan');
    if (planInput) planInput.value = plan || '';
    waitlistModal.classList.add('active');
    const first = waitlistModal.querySelector('#wl-name');
    first?.focus();
}

document.addEventListener('DOMContentLoaded', () => {

    // Mobile Navigation Toggle with accessibility
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-menu');

    if (menuToggle && navLinks) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-controls', navLinks.id);

        const trapFocus = (e) => {
            if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
            const focusable = navLinks.querySelectorAll('a');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            } else if (e.key === 'Escape') {
                menuToggle.click();
            }
        };

        menuToggle.addEventListener('click', () => {
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!expanded));
            navLinks.classList.toggle('active');
            if (!expanded) {
                const firstLink = navLinks.querySelector('a');
                firstLink?.focus();
                document.addEventListener('keydown', trapFocus);
            } else {
                document.removeEventListener('keydown', trapFocus);
                menuToggle.focus();
            }
        });
    }

    if (window.supabaseClient) {
        window.supabaseClient.auth.getSession().then(({ data }) => {
            updateNav(data.session);
        });
        window.supabaseClient.auth.onAuthStateChange((_event, session) => {
            updateNav(session);
        });
    }

    // Checkout link mapping
    const planLinks = document.querySelectorAll('[data-plan]');
    planLinks.forEach(link => {
        const slug = link.getAttribute('data-plan');
        if (window.checkoutLinks?.[slug]) {
            link.href = window.checkoutLinks[slug];
        }
    });

    const sanitizeRedirect = (url) => {
        try {
            const u = new URL(url, window.location.origin);
            if (u.origin !== window.location.origin) return '/pricing.html';
            if (!u.pathname.startsWith('/')) return '/pricing.html';
            return u.pathname + u.search + u.hash;
        } catch {
            return '/pricing.html';
        }
    };

    upgradeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!currentSession) {
                e.preventDefault();
                const dest = sanitizeRedirect(link.getAttribute('href') || '/pricing.html');
                window.location.href = `auth.html?redirect=${encodeURIComponent(dest)}`;
            }
        });
    });

    // Product gating overlay
    function initProductGates() {
        if (!document.body.classList.contains('gated')) return;
        const cards = document.querySelectorAll('[data-gated]');
        cards.forEach(card => {
            if (card.dataset.gateInit === 'true') return;
            card.dataset.gateInit = 'true';
            card.classList.add('gate-active');
            if (getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }
            // remove focus from underlying interactive elements
            card.querySelectorAll('a, button, input, textarea, select').forEach(el => {
                if (!el.closest('.gate-overlay')) {
                    el.setAttribute('tabindex', '-1');
                }
            });
            const overlay = document.createElement('div');
            overlay.className = 'gate-overlay';
            overlay.setAttribute('role', 'region');
            overlay.setAttribute('aria-label', 'Invite-only gate');

            const banner = document.createElement('div');
            banner.className = 'gate-banner';
            banner.textContent = 'Coming soon — invite only';
            overlay.appendChild(banner);

            const cta = document.createElement('div');
            cta.className = 'gate-cta';

            const headline = document.createElement('p');
            headline.className = 'gate-headline';
            headline.textContent = 'Access by invitation.';
            cta.appendChild(headline);

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-primary gate-btn';
            const plan = card.dataset.plan || '';
            if (plan) btn.dataset.plan = plan;
            btn.textContent = 'Join the waitlist';
            btn.addEventListener('click', () => {
                window.dataLayer?.push({
                    event: 'waitlist_click',
                    plan,
                    location_path: window.location.pathname,
                    ref: document.referrer || ''
                });
                openWaitlistModal(plan);
            });
            cta.appendChild(btn);

            overlay.appendChild(cta);
            card.appendChild(overlay);
        });
    }

    initProductGates();

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
