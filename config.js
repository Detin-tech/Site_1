module.exports = {
  planPrefix: 'plan:',
  planGroups: {
    // Map Lemon Squeezy variant IDs to OWUI group names
    '12345': 'plan:student',
    '23456': 'plan:standard',
    '34567': 'plan:pro',
  },
  grantStatuses: ['active', 'on_trial'],
  owui: {
    apiBaseUrl: process.env.OWUI_API_BASE_URL,
    apiToken: process.env.OWUI_API_TOKEN,
  },
  lemonSqueezy: {
    webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
  },
};
