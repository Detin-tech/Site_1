const express = require('express');
const crypto = require('crypto');
const { recordEvent } = require('./db');
const config = require('./config');

// Simple in-memory queue for provisioning jobs
const queue = [];

const app = express();

app.get('/healthz', (req, res) => res.json({ ok: true }));

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

  // Idempotency check with persistent store
  if (!recordEvent(eventId)) {
    return res.json({ status: 'duplicate' });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf8'));
  } catch (err) {
    console.error('Failed to parse JSON', err);
    return res.status(400).send('Invalid JSON');
  }

  const eventName = payload.meta?.event_name;
  const data = payload.data?.attributes || {};
  const email = data.user_email || data.email;
  const variantId = data.variant_id;
  const customerId = data.customer_id;
  const subscriptionId = payload.data?.id;
  const status = data.status;

  let targetGroup = 'plan:free';
  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
      if (config.grantStatuses.includes(status)) {
        targetGroup = config.planGroups[variantId] || 'plan:free';
      }
      break;
    case 'subscription_cancelled':
    case 'subscription_expired':
      targetGroup = 'plan:free';
      break;
    case 'subscription_payment_failed':
      console.warn('Payment failed', { eventId, email, customerId, subscriptionId, variantId });
      return res.json({ status: 'payment_failed' });
    default:
      console.log('Unhandled event', eventName);
      return res.json({ status: 'ignored' });
  }

  if (!email) {
    console.error('Email missing from event', { eventId, customerId, subscriptionId });
    return res.json({ status: 'missing_email' });
  }

  queue.push({ email, targetGroup, eventId, eventName, customerId, subscriptionId, variantId, status, attempt: 0 });
  res.json({ ok: true });
});

async function syncUser(email, planGroup) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.owui.apiToken}`,
  };

  // Fetch existing user
  let user;
  const listResp = await fetchWithTimeout(`${config.owui.apiBaseUrl}/users?email=${encodeURIComponent(email)}`, { headers });
  if (listResp.ok) {
    const users = await listResp.json();
    if (Array.isArray(users)) {
      user = users.find((u) => u.email === email);
    } else if (users && users.email === email) {
      user = users;
    }
  }

  let groups = [];
  if (user && Array.isArray(user.groups)) {
    groups = user.groups.filter((g) => !g.startsWith(config.planPrefix));
  }
  groups.push(planGroup);

  if (user) {
    const resp = await fetchWithTimeout(`${config.owui.apiBaseUrl}/users/${user.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ groups, is_active: true }),
    });
    if (!resp.ok) {
      throw new Error(`OWUI API error ${resp.status}`);
    }
  } else {
    const resp = await fetchWithTimeout(`${config.owui.apiBaseUrl}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, groups, is_active: true }),
    });
    if (!resp.ok) {
      throw new Error(`OWUI API error ${resp.status}`);
    }
  }
}

async function processQueue() {
  if (queue.length === 0) return;
  const job = queue.shift();
  try {
    await syncUser(job.email, job.targetGroup);
    console.log('Provisioned', {
      eventId: job.eventId,
      eventName: job.eventName,
      email: job.email,
      targetGroup: job.targetGroup,
    });
  } catch (err) {
    console.error('Provisioning failed', { eventId: job.eventId, error: err.message });
    if (job.attempt < 3) {
      job.attempt += 1;
      setTimeout(() => queue.push(job), job.attempt * 1000);
    }
  }
}

setInterval(processQueue, 1000);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
