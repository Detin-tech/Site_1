const express = require('express');
const crypto = require('crypto');
const config = require('./config');

// In-memory store for processed event IDs to ensure idempotency during runtime
const processedEvents = new Set();

const app = express();

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

  // Idempotency check
  if (processedEvents.has(eventId)) {
    return res.json({ status: 'duplicate' });
  }
  processedEvents.add(eventId);

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

  // Determine desired plan group
  let targetGroup;
  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
      targetGroup = config.planGroups[variantId] || 'plan:free';
      break;
    case 'subscription_cancelled':
    case 'subscription_expired':
      targetGroup = 'plan:free';
      break;
    case 'subscription_payment_failed':
      console.warn('Payment failed', { email, customerId, subscriptionId });
      return res.json({ status: 'payment_failed' });
    default:
      console.log('Unhandled event', eventName);
      return res.json({ status: 'ignored' });
  }

  try {
    await syncUser(email, targetGroup);
    console.log(`Processed ${eventName} for ${email} -> ${targetGroup}`);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Provisioning failed', err);
    res.status(500).json({ status: 'error' });
  }
});

async function syncUser(email, planGroup) {
  const resp = await fetch(`${config.owui.apiBaseUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.owui.apiToken}`,
    },
    body: JSON.stringify({ email, groups: [planGroup], is_active: true }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OWUI API error ${resp.status}: ${text}`);
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
