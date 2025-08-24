const path = require('path');
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;
const LEMON_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

const app = express();

// ---- Static site (auth.html, assets, etc.) ----
app.use(express.static(path.join(__dirname)));

// ---- Health ----
app.get('/healthz', (req, res) => res.json({ ok: true }));


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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

app.post('/request-invite', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'admin@prosperspot.com',
      subject: 'Early Access Request',
      text: `Please invite ${email}`,
    });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to send invite', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Site + auth server running on http://127.0.0.1:${PORT}`);
});

