const path = require('path');
const express = require('express');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const cookieDomain = process.env.COOKIE_DOMAIN || '.prosperspot.com';
const LEMON_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

const app = express();

// ---- Static site (auth.html, assets, etc.) ----
app.use(express.static(path.join(__dirname)));

// ---- Health ----
app.get('/healthz', (req, res) => res.json({ ok: true }));

// ---- Sessions ----
app.post('/session/set', express.json(), (req, res) => {
  const token = req.body?.access_token;
  if (!token) return res.status(400).json({ error: 'access_token required' });

  res.setHeader(
    'Set-Cookie',
    `sb=${token}; Domain=${cookieDomain}; Path=/; Secure; SameSite=None; HttpOnly; Max-Age=3600`
  );
  res.json({ ok: true });
});

app.post('/session/clear', (req, res) => {
  res.setHeader(
    'Set-Cookie',
    `sb=; Domain=${cookieDomain}; Path=/; Secure; SameSite=None; Max-Age=0`
  );
  res.json({ ok: true });
});

app.get('/logout', (req, res) => {
  res.setHeader(
    'Set-Cookie',
    `sb=; Domain=${cookieDomain}; Path=/; Secure; SameSite=None; Max-Age=0`
  );
  res.redirect('/');
});

// ---- Lemon Squeezy webhook ----
// IMPORTANT: raw body ONLY for this one route.
app.post('/webhooks/lemonsqueezy',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.get('x-signature') || '';
    const body = req.body; // Buffer

    // Verify signature
    const computed = crypto.createHmac('sha256', LEMON_SECRET)
      .update(body)
      .digest('hex');
    if (!LEMON_SECRET || signature !== computed) {
      console.error('Invalid signature');
      return res.status(400).send('Invalid signature');
    }

    // Parse JSON
    let event;
    try { event = JSON.parse(body.toString('utf8')); }
    catch { return res.status(400).send('Bad JSON'); }

    console.log('Lemon Squeezy event', event.meta?.event_name, event.data?.attributes?.user_email);

    // TODO: forward to your Worker or enqueue here for OWUI sync
    // For now, just ack
    res.json({ status: 'ok' });
  }
);

// ---- Fallback JSON body parser (for other POSTs) ----
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Site + auth server running on http://127.0.0.1:${PORT}`);
});

