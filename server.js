const path = require('path');
const express = require('express');
const crypto = require('crypto');

const { recordEvent } = require('./db');
const config = require('./config');
const cookieDomain = process.env.COOKIE_DOMAIN || '.prosperspot.com';


const PORT = process.env.PORT || 3000;
const cookieDomain = process.env.COOKIE_DOMAIN || '.prosperspot.com';
const LEMON_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

const app = express();


app.get('/healthz', (req, res) => res.json({ ok: true }));

app.post('/session/set', express.json(), (req, res) => {
  const accessToken = req.body?.access_token;
  if (!accessToken) {
    return res.status(400).json({ error: 'access_token required' });
  }
  res.setHeader(
    'Set-Cookie',
    `sb=${accessToken}; Domain=${cookieDomain}; Path=/; Secure; SameSite=None; HttpOnly; Max-Age=3600`
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

function fetchWithTimeout(url, opts = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...opts, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

// Use raw body for signature verification
app.post('/webhooks/lemonsqueezy', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.get('x-signature');
  const eventId = req.get('x-event-id');

  // Verify signature
  const computed = crypto
    .createHmac('sha256', config.lemonSqueezy.webhookSecret || '')
    .update(req.body)
    .digest('hex');
  if (signature !== computed) {
    console.error('Invalid signature', { eventId });
    return res.status(400).send('Invalid signature');
  }


// Health
app.get('/healthz', (req, res) => res.json({ ok: true }));

// ---- Sessions ----
app.post('/session/set', express.json(), (req, res) => {
  const token = req.body?.access_token;
  if (!token) return res.status(400).json({ error: 'access_token required' });

  res.setHeader('Set-Cookie',
    `sb=${token}; Domain=${cookieDomain}; Path=/; Secure; SameSite=None; HttpOnly; Max-Age=3600`
  );
  res.json({ ok: true });
});

app.post('/session/clear', (req, res) => {
  res.setHeader('Set-Cookie',
    `sb=; Domain=${cookieDomain}; Path=/; Secure; SameSite=None; Max-Age=0`
  );
  res.json({ ok: true });
});

app.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie',
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

    // TODO: upsert into Supabase + enqueue OWUI /api/internal/upsert-users
    // This part is environment-specific and you already have it in your Worker.
    // You can either:
    //  - keep using your Worker for cron syncing
    //  - or mirror the logic here, calling OWUI directly with OWUI_API_TOKEN

    res.json({ status: 'ok' });
  }
);

// Fallback: JSON for non-matched POSTs
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Site + auth server running on http://127.0.0.1:${PORT}`);
});

